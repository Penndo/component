import * as React from "react"
import { useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import TableEdit from "./TableEdit"
import {shearData,recalculate_CellSize} from "../Public/Tools"

import style from "./index.module.less"

//获取当前事件的位置
function eventPosition(e) {
    //获取点击的td
    let currentTd = e.target.tagName === "TD" ? e.target : e.target.parentNode;
    //获取点击的tr
    let currentTr = e.target.tagName === "TD" ? e.target.parentNode : e.target.parentNode.parentNode;
    //获取所有的tds
    let tds = currentTr.childNodes
    //获取所有的trs
    let trs = currentTr.parentNode.childNodes
    //获取当前 td 所处的位置.先将 tds 转换为数组，再用 indexOf 方法获取当前 td 的位置
    let tdIndex = Array.from(tds).indexOf(currentTd);
    //获取当前 tr 所处的位置
    let trIndex = Array.from(trs).indexOf(currentTr);
    return {"tdIndex":tdIndex,"trIndex":trIndex}
}

export default function Table(props) {

    const {controlData,cellSize,colID,rowID,getColID,getRowID,getControlData, getCellSize, getRenderData, getRenderHead,dynamicData,dynamicHead,setDynamicData,setDynamicHead} = props;
    const {cols,rows} = controlData.tableAmount;

    //获取数据源、参数
    // const {api} = controlData.dataFrom;
    // const apiParameter = controlData.dataFrom.parameter;

    //用来控制右键菜单是否可见的状态
    const [visable, setVisable] = useState("none");
    
    //获取当前右键点击的 td 或 tr 位置
    const [tdIndex, setTdIndex] = useState(null)
    const [trIndex, setTrIndex] = useState(null)

    const rightPanel = useRef(null);
    const table = useRef(null)

    //渲染数据
    const [renderHead, setRenderHead] = useState([]);
    const [renderData, setRenderData] = useState([]);

    const tableWidth = controlData.tableWidth;
    const {b_top,b_right,b_bottom,b_left} = controlData.tbodyPadding;
    const {h_top,h_bottom} = controlData.theadPadding;
    const reservedWidth = (b_left*1 + b_right*1) + "px";



    // React.useEffect(() => {
    //     //将表头数据整合为对象，并加入 key
    //     let addKeyHead = [];
    //     let parameter = apiParameter.split(",");
    //     for(let i=0;i<parameter.length;i++){
    //         let headItem = {};
    //         headItem.title = parameter[i];
    //         headItem.key = uuidv4();
    //         addKeyHead.push(headItem);
    //     }
    //     setDynamicHead(addKeyHead);

    //     //fetch请求成功后更新 dynamicData
    //     fetch(api+apiParameter)
    //     .then((response) => response.json())
    //     .then((json) => {
    //         setDynamicData(
    //             //为原始数据加上 key
    //             function (){
    //                 let addKeyData = json.results.slice()
    //                 for(let i=0;i<addKeyData.length;i++){
    //                     addKeyData[i]["key"] = uuidv4();
    //                 }
    //                 return addKeyData;
    //             }
    //         );
    //     });
    // },[api,apiParameter,setDynamicHead,setDynamicData])

    React.useEffect(()=>{
        //复制一份 tbody 和 thead 的数据
        let longestData = dynamicData.slice();
        let longestHead = dynamicHead.slice();

        //裁切数据，删除掉大于表格数量的数据，表格数量不够的话进行补充
        //更新 controlData, 比较cols和longestHead.length的大小。如果cols<longestHead.length,就对现有表格进行裁剪，如果cols>longestHead.length,就对表格数量进行增加。
        let readyRenderHead = shearData(cols,longestHead,colID,"colID",getColID);
        let readyRenderData = shearData(rows,longestData,rowID,"rowID",getRowID);
        
        //此时，数据新增了，但是 dynamicData 的数据没变，还是原始数据。
        let mergedHead = [];

        // 处理 readyRenderHead 中的 serialNumber，使其为对应的编号。
        for(let i=0;i<readyRenderHead.length;i++){
            let col = {};
            readyRenderHead[i]["serialNumber"] = i;
            col["title"] = "";
            Object.assign(col, readyRenderHead[i]);
            mergedHead.push(col);
        }

        // 整合数据，新建一个空数据容器
        let mergedData = [];

        //填充并合并数据
        for(let i=0;i<readyRenderData.length;i++){
            let row = {};
            // 根据列数来循环，以此确定将要往 row 这个空对象中添加多少个 key:value
            for(let j=0;j<readyRenderHead.length;j++){
                //先将标题中的值定义为 “”，再用原有的数据去覆盖。
                row[readyRenderHead[j]["colID"]] = "";
            }
            //用原有数据去覆盖生成的新数据。
            Object.assign(row, readyRenderData[i]);
            //将对象放入 mergedData 中
            mergedData.push(row);
        } 

        setRenderHead(mergedHead);
        setRenderData(mergedData);
        getRenderData(mergedData);
        getRenderHead(mergedHead);

    },[cols,rows,dynamicHead,dynamicData,getRenderData,getRenderHead,colID,rowID,getColID,getRowID])
    
    React.useEffect(()=>{
        //获取行的高度。因为我们没有手动去干预，如果后面需要手动干预高度，可能这里也不需要了
        let tableRows = Array.from(table.current.rows);
        let newstHeightArr = [];
        let newCellSize = {};
        for(let i=0;i<tableRows.length;i++){
            newstHeightArr.push(tableRows[i].offsetHeight)
        };

        if(Math.max(...newstHeightArr) === 0){
            newCellSize = {
                height:[40,40,40,40,40],
                width:[160,160,160,160]
            };
        }else{
            newCellSize.width = cellSize.width;
            newCellSize.height = newstHeightArr;
        }
        console.log(table.current.rows.length)
        getCellSize(newCellSize);
    },[renderHead,renderData,cellSize.width,getCellSize])
    // console.log(table.current.rows.length)

    //table 输入
    function changeTbodyValue(e){
        const {trIndex,tdIndex} = eventPosition(e);
        let insert = renderData.slice();
        insert[trIndex][renderHead[tdIndex]["colID"]] = e.target.value;
        setDynamicData(insert);
    }

    function changeTheadValue(e){
        const {tdIndex} = eventPosition(e);
        //获取最新输入的值。
        let insertHead = renderHead.slice();
        insertHead[tdIndex]["title"] = e.target.value;
        setDynamicHead(insertHead);
    }
    
    //自定义右键菜单
    function forRight(e) {
        //阻止鼠标右键的默认行为
        e.preventDefault()
        //通过修改状态来隐藏或显示右键菜单
        setVisable("block")
        //获取当前鼠标的 x 坐标
        const clickX = e.clientX
        //获取当前鼠标的 y 坐标
        const clickY = e.clientY
        //为 右键菜单 标记了 refs 标签 (rightPanel)。这里引用并设置右键菜单的位置
        //（已经设置 ul 的 position 为 absolute ）。
        rightPanel.current.style.left = clickX + "px"
        rightPanel.current.style.top = clickY + "px"
        const {trIndex,tdIndex} = eventPosition(e);
        //更新当前事件的位置
        setTdIndex(tdIndex)
        setTrIndex(trIndex)
        //为 document 添加一个全局点击事件，用来隐藏右键菜单
        document.addEventListener("click",handleDocument)
    }

    function getValue(name,value){
        let tableAmount = controlData.tableAmount
        getControlData("tableAmount",{...tableAmount,[name]:value})
    }

    //隐藏右键
    function handleDocument(){
        setVisable("none")
        //隐藏后移除全局事件。
        document.removeEventListener("click",handleDocument)
    }

    //增减行
    function changeRow(how){
        return function() {
            let insert = renderData.slice()
            switch (how) {
                case "after":
                    insert.splice(trIndex + 1, 0, {key:uuidv4(),rowID:rowID+1});
                    break;
                case "front":
                    insert.splice(trIndex, 0, {key:uuidv4(),rowID:rowID+1});
                    break;
                case "remove":
                    insert.splice(trIndex, 1)
                    break;
                default:
                    break;
            }
            //先去更新了dynamicData,然后导致renderData 的更新，进而重新渲染页面。
            getValue("rows",insert.length);
            console.log(cellSize)
            setDynamicData(insert);
            setVisable("none");
            //然后改变了 controlData 中的数值
            getRowID(rowID + 1)
        }
    }

    //增减列
    function changeCol(how){
        return function(){
            const width = 160;
            let cellWidthArr = cellSize.width.slice();
            let insert = renderHead.slice();
            switch (how) {
                case "after":
                    insert.splice(tdIndex + 1, 0, {key:uuidv4(),colID:colID+1});
                    cellWidthArr.splice(tdIndex + 1, 0, width)
                    break;
                case "front":
                    insert.splice(tdIndex, 0, {key:uuidv4(),colID:colID+1});
                    cellWidthArr.splice(tdIndex, 0, width)
                    break;
                case "remove":
                    insert.splice(tdIndex, 1);
                    cellWidthArr.splice(tdIndex, 1)
                    break;
                default:
                    break;
            }
            let newCellSize = recalculate_CellSize(cellWidthArr,tableWidth);
            getCellSize({...cellSize,...newCellSize});
            setDynamicHead(insert); //这里更新了 dynamic 所以可以正常展示。
            setVisable("none");
            getValue("cols",insert.length);
            getColID(colID + 1)
        }
    }

    //复制行
    function duplicateRow(){
        return function() {
            let insert = renderData.slice();
            let copiedRow = insert[trIndex];
            let keyWords = {
                key:uuidv4(),rowID:rowID+1
            };
            let merged = {...copiedRow,...keyWords};

            insert.splice(trIndex + 1, 0, merged);

            setDynamicData(insert);
            setVisable("none");
            getValue("rows",insert.length);
            getRowID(rowID + 1)
        }
    }

    //复制列
    function duplicateCol(){
        return function(){
            const width = 160;
            let cellWidthArr = cellSize.width.slice();
            let insert_Head = renderHead.slice();
            let insert_Data = renderData.slice();
            let copiedTitle = insert_Head[tdIndex].title;
            let newColID = colID + 1;
            let newCellSize;

            insert_Head.splice(tdIndex + 1, 0, {title:copiedTitle,key:uuidv4(),colID:newColID});
            insert_Data.forEach((obj)=>{
                obj[newColID] = obj[insert_Head[tdIndex].colID]
            });

            cellWidthArr.splice(tdIndex + 1, 0, width);
            newCellSize = recalculate_CellSize(cellWidthArr,tableWidth);

            getCellSize({...cellSize,...newCellSize});
            setDynamicHead(insert_Head); 
            setDynamicData(insert_Data);
            setVisable("none");
            getValue("cols",insert_Head.length);
            getColID(colID + 1)
        }
    }

    //清空行
    function clearRow(){
        return function() {
            let insert = renderData.slice();
            let willClearRow = insert[trIndex];

            for(let property in willClearRow){
                if(property !== "key" && property !== rowID){
                    insert[trIndex][property] = ""
                }
            };

            setDynamicData(insert);
            setVisable("none");
        }
    }

    //清空列
    function clearCol(){
        return function() {
            let insert_Head = renderHead.slice();
            let insert_Data = renderData.slice();

            insert_Head[tdIndex].title = "";
            insert_Data.forEach((obj)=>{
                obj[insert_Head[tdIndex].colID] = ""
            });

            setDynamicHead(insert_Head); 
            setDynamicData(insert_Data);
            setVisable("none");
        }
    }

    //定义表格可拖动的原始值
    const [dragableTable, setDragableTable] = useState({
        scaleTheadArr:[],
        widthArr:[],
        currentWidth:"",
        status:false,
        ox:"",
        index:""
    });
    
    //给一个初始的单元格宽度，表格宽度除以表头数量然后取整。
    const defaultCellWidth = Math.floor(tableWidth / renderHead.length);

    //鼠标按下的时候
    function onMouseDown(event){
        if(event.target.tagName === "TH"){

            //获取鼠标按下获取到的那个元素
            let mouseDownCurrent = event.target;
            //获取 thead 中的所有子元素
            let mouseDowntheadItems = mouseDownCurrent.parentNode.cells;
            //将获取的 thead 中的所有子元素放入数组
            let mouseDowntheadArr = Array.from(mouseDowntheadItems);
            //获取当前单元格的序号
            let mouseDownCurrentIndex = mouseDowntheadArr.indexOf(mouseDownCurrent)

            //如果不是最后一个单元格，且鼠标位置在单元格右侧侧 8 像素范围内
            if(mouseDownCurrentIndex !== mouseDowntheadArr.length-1 && event.nativeEvent.offsetX > mouseDownCurrent.offsetWidth - 8){
                
                //鼠标手势变为拖动手势
                mouseDownCurrent.style.cursor = "col-resize";
                
                //记录之前的单元格宽度
                let oldCellWidthArr = [];
                for(let i=0;i<mouseDowntheadArr.length;i++){
                    oldCellWidthArr.push(mouseDowntheadArr[i].offsetWidth)
                }
                
                //更新状态
                setDragableTable({
                    scaleTheadArr:mouseDowntheadArr,
                    widthArr:oldCellWidthArr,
                    currentWidth:mouseDownCurrent.offsetWidth,
                    status:true,
                    ox:event.clientX,
                    index:mouseDownCurrentIndex,
                });
            }
        }
    }
    

    //鼠标移动的时候
    function onMouseMove(event){
        let current, tHeadItems, tHeadArr, currentIndex
        if(event.target.tagName === "TH"){
            current = event.target
            tHeadItems = current.parentNode.cells;
            tHeadArr = Array.from(tHeadItems)
            currentIndex = tHeadArr.indexOf(current);
            
            //同样的要去检测鼠标位置以及他的事件对象
            if(currentIndex !== tHeadArr.length-1 && event.nativeEvent.offsetX > current.offsetWidth - 8){
                current.style.cursor = "col-resize";
            }else{
                current.style.cursor = "default";
            }            
        }

        //鼠标按下的时候将已经表格的拖动状态设置为 true
        if(dragableTable.status === true){
    
            //x的变量等于当前鼠标的 offsetX 减去 mouseDown 时初次获取的鼠标位置
            const deltaX = event.clientX - dragableTable.ox;

            //有多少个需要改变宽度的单元格? 需要改变宽度的单元格数量是鼠标事件序号之后的所有单元格
            const deltaCount = dragableTable.scaleTheadArr.length - 1 - dragableTable.index;

            //基础增量，每一个单元格增加的量：deltaX 减去 除不净（deltaX % 要改变宽度的单元格数量）的量，然后再除以要改变宽度的单元格数量。
            const cellDeltaX = (deltaX - deltaX % deltaCount)/deltaCount;
                      
            for(let i=0;i<dragableTable.scaleTheadArr.length;i++){
                if(i < dragableTable.index){
                    dragableTable.scaleTheadArr[i].style.width = dragableTable.widthArr[i] + "px"
                }else if(i === dragableTable.index){
                    dragableTable.scaleTheadArr[i].style.width = dragableTable.currentWidth + deltaX + "px";
                }else if(i === currentIndex + 1){
                    dragableTable.scaleTheadArr[i].style.width = dragableTable.widthArr[i] - cellDeltaX - deltaX % deltaCount + "px"
                }else{
                    dragableTable.scaleTheadArr[i].style.width = dragableTable.widthArr[i] - cellDeltaX + "px"
                }
            }
           
        }
    }
    
    //这里导致 width.length 为 0
    function onMouseUp(event){
        if(event.target.tagName === "TH"){
            setDragableTable({...dragableTable,status:false});
            event.target.style.cursor = "default";
            let newstWidthArr = [];
            let newstHeightArr = [];
            let cellSize = {};
        
            for(let i=0;i<dragableTable.scaleTheadArr.length;i++){
                newstWidthArr.push(dragableTable.scaleTheadArr[i].offsetWidth)
                newstHeightArr.push(dragableTable.scaleTheadArr[i].offsetHeight*1)
            }
            
            cellSize.width = newstWidthArr;
            cellSize.height = newstHeightArr;
            console.log(cellSize.width)
            getCellSize(cellSize)
        }
    }

    function fontWeight(value){
        let fontWeight;
        switch (value) {
            case "light":
                fontWeight = 200
                break;
            case "regular":
                fontWeight = 400;
                break;
            case "bold":
                fontWeight = 600;
                break;
            default:
                break;
        }
        return fontWeight
    }

    return (
        <div className={style.tableContainer}>
            {/* 这里创建右键菜单，默认隐藏 */}
            <div className={style.rightPanel} ref={rightPanel} >
                <TableEdit 
                    display={visable}
                    addRowOnTop={changeRow("front")} 
                    addRowOnBottom={changeRow("after")}
                    addColLeft={changeCol("front")}
                    addColRight={changeCol("after")}
                    removeCurrentRow={changeRow("remove")}
                    removeCurrentCol={changeCol("remove")}
                    duplicateRow = {duplicateRow()}
                    duplicateCol = {duplicateCol()}
                    clearRow = {clearRow()}
                    clearCol = {clearCol()}
                />
            </div>

            <table
                ref = {table}
                onMouseDown = {onMouseDown}
                onMouseMove = {onMouseMove}
                onMouseUp={onMouseUp}
                style={{
                    width:tableWidth*1 + 1 + "px"
                }}>
                <colgroup>
                    {renderHead.map(()=>{
                        return (<col key={uuidv4()}></col>) 
                    })}
                </colgroup>
                <thead>
                    <tr>
                        {renderHead.map((cell,index) => {
                            return <th 
                                key={cell["key"]}
                                style={{
                                    width:cellSize.width.length ? cellSize.width[index] : defaultCellWidth,
                                    // width:index !== renderHead.length - 1 ? defaultCellWidth : "",
                                    backgroundColor:controlData.theadFill.basicColor,
                                    borderRight:controlData.border.intervalColor !== "" && index !== renderHead.length-1 ? `1px solid ${controlData.border.intervalColor}`: "none",
                                    borderBottom:`1px solid ${controlData.border.basicColor}`
                                }}
                            >
                                <input 
                                    type="text" 
                                    value={cell["title"]} 
                                    onChange={changeTheadValue}
                                    style={{
                                        width:`calc(100% - ${reservedWidth})`,
                                        color:controlData.theadTextStyle.basicColor,
                                        fontSize:controlData.theadTextStyle.fontSize+ "px",
                                        fontWeight:fontWeight(controlData.theadTextStyle.fontWeight),
                                        marginTop:h_top + "px",
                                        marginRight:b_right + "px",
                                        marginBottom:h_bottom + "px" ,
                                        marginLeft:b_left + "px",
                                        padding:0
                                    }}
                                />
                            </th>
                        })}
                    </tr>
                </thead>
                <tbody>
                    {renderData.map((perObject,rowIndex) => {
                        return (
                            <tr key={perObject["key"]}>
                                {renderHead.map((cell,cellIndex) => {
                                    return (
                                        <td
                                            style={{
                                                //隔行换色开启，且行数为奇数时，填充intervalColor, 否则填充 basicColor
                                                backgroundColor:controlData.fill.intervalColor !== "" && rowIndex%2 === 1 ? controlData.fill.intervalColor : controlData.fill.basicColor,
                                                borderRight:controlData.border.intervalColor !== "" && cellIndex !== renderHead.length-1 ? `1px solid ${controlData.border.intervalColor}`: "none",
                                                borderBottom:`1px solid ${controlData.border.basicColor}`
                                            }}
                                            onContextMenu={forRight}
                                            key={perObject["key"]+cell["key"]}
                                        >
                                            <input type="text" 
                                                value={perObject[cell["colID"]]} 
                                                onChange={changeTbodyValue}
                                                style={{
                                                    width:`calc(100% - ${reservedWidth})`,
                                                    color:controlData.textStyle.basicColor,
                                                    fontSize:controlData.textStyle.fontSize+"px",
                                                    fontWeight:fontWeight(controlData.textStyle.fontWeight),
                                                    marginTop:b_top+"px",
                                                    marginRight:b_right+"px",
                                                    marginBottom:b_bottom+"px",
                                                    marginLeft:b_left+"px",
                                                    padding:0
                                                }}
                                            />
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
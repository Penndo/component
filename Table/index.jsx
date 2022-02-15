import * as React from "react"
import { useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import TableEdit from "./TableEdit"
import {shearData} from "../Public/Tools"

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

    const {controlData,cellSize, getControlData, getCellSize, getRenderData, getRenderHead,dynamicData,dynamicHead,setDynamicData,setDynamicHead} = props;
    //获取行、列数
    const {cols,rows} = controlData.tableAmount;

    //获取数据源、参数
    const {api} = controlData.dataFrom;
    const apiParameter = controlData.dataFrom.parameter;

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

    React.useEffect(() => {
        //将表头数据整合为对象，并加入 key
        let addKeyHead = [];
        let parameter = apiParameter.split(",");
        for(let i=0;i<parameter.length;i++){
            let headItem = {};
            headItem.title = parameter[i];
            headItem.key = uuidv4();
            addKeyHead.push(headItem);
        }
        setDynamicHead(addKeyHead);

        //fetch请求成功后更新 dynamicData
        fetch(api+apiParameter)
        .then((response) => response.json())
        .then((json) => {
            setDynamicData(
                //为原始数据加上 key
                function (){
                    let addKeyData = json.results.slice()
                    for(let i=0;i<addKeyData.length;i++){
                        addKeyData[i]["key"] = uuidv4();
                    }
                    return addKeyData;
                }
            );
        });
    },[api,apiParameter,setDynamicHead,setDynamicData])

    React.useEffect(()=>{

        //获取当前 table 的行和列。列从行中进一步获取。
        let tableRows = Array.from(table.current.rows);
        let tableCols = Array.from(table.current.rows[0].cells);

        //获取单元格宽度
        let newstWidthArr = [];
        //获取单元格高度
        let newstHeightArr = [];
        //用来存放单元格尺寸的对象
        let newCellSize = {};

        //用循环获得行的高度
        for(let i=0;i<tableRows.length;i++){
            newstHeightArr.push(tableRows[i].offsetHeight)
        };

        //用循环获得列的宽度
        for(let i=0;i<tableCols.length;i++){
            newstWidthArr.push(tableCols[i].offsetWidth)
        };
    
        //将获取的尺寸放进尺寸对象中
        newCellSize.width = newstWidthArr;
        newCellSize.height = newstHeightArr;
        getCellSize(newCellSize);


        //复制一份 tbody 和 thead 的数据
        let longestData = dynamicData.slice();
        let longestHead = dynamicHead.slice();

        //裁切数据，删除掉大于表格数量的数据，表格数量不够的话进行补充
        //更新 controlData, 比较cols和longestHead.length的大小。如果cols<longestHead.length,就对现有表格进行裁剪，如果cols>longestHead.length,就对表格数量进行增加。
        let readyRenderHead = shearData(cols,longestHead);
        let readyRenderData = shearData(rows,longestData);
        //此时，数据新增了，但是dynamicData 的数据没变，还是原始数据。

        //处理 readyRenderHead 中的 title，使其不能为空，而是对应的列数
        for(let i=0;i<readyRenderHead.length;i++){
            if(typeof readyRenderHead[i]["title"] === "number" || readyRenderHead[i]["title"] === "" || readyRenderHead[i]["title"] === undefined){
                readyRenderHead[i]["title"] = i;
            }
        }

        // 整合数据，新建一个空数据容器
        let mergedData = [];

        //填充并合并数据
        for(let i=0;i<readyRenderData.length;i++){
            let row = {};
            //根据列数来循环，以此确定将要往 row 这个空对象中添加多少个 key:value
            for(let j=0;j<readyRenderHead.length;j++){
                //先将标题中的值定义为 “”，再用原有的数据去覆盖。
                row[readyRenderHead[j]["title"]] = "";
            }
            //用原有数据去覆盖生成的新数据。
            Object.assign(row, readyRenderData[i]);
            //将对象放入 mergedData 中
            mergedData.push(row);
        } 
        
        // console.log(mergedData)
        setRenderHead(readyRenderHead);
        setRenderData(mergedData);
        //获取 renderData，renderHead 数据返回给 头部的 App。为什么？因为最后需要把这部分数据传给 sketch
        getRenderData(mergedData);
        getRenderHead(readyRenderHead);
        
    },[cols,rows,dynamicHead,dynamicData,getRenderData,getRenderHead,getCellSize,controlData])
  
    //table 输入
    function changeTbodyValue(e){
        const {trIndex,tdIndex} = eventPosition(e);
        let insert = renderData.slice();
        insert[trIndex][renderHead[tdIndex]["title"]] = e.target.value;
        setDynamicData(insert);
    }


    //记录表头最后的值。保证表格不会因为表头的值被删除了而出现异常。
    const [lastHead, setLastHead] = useState("");

    function gitInitialHead(e){
        console.log("focus")
        setLastHead(e.target.value);
    }

    function changeTheadValue(e){
        const {tdIndex} = eventPosition(e);

        //获取最新输入的值。
        let newTitle = e.target.value
        let insertData = renderData.slice();
        let insertHead = renderHead.slice();

        //表头内容不能为空, 且当前输入项不能等于表头中的其他项。
        //find(), 查找数组中的某个复合条件的元素是否存在。如果存在返回第一个找到的值，如果不存在，返回 undefined
        const equal = insertHead.find(element => element.title === newTitle) === undefined;

        if(newTitle !== "" && equal){
            //表格数据要以表头数据为参考，这里修改了表头的值，表格数据就不能正常展示了。
            insertHead[tdIndex]["title"] = e.target.value;

            //循环renderData 中的所有项。为 newTitle 赋值
            for(let i=0;i<insertData.length;i++){
                insertData[i][newTitle] = insertData[i][lastHead];
                delete insertData[i][lastHead];
            }

            setLastHead(newTitle);

            setDynamicData(insertData);
            setDynamicHead(insertHead);
        }
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
                    insert.splice(trIndex + 1, 0, {key:uuidv4()});
                    break;
                case "front":
                    insert.splice(trIndex, 0, {key:uuidv4()});
                    break;
                case "remove":
                    insert.splice(trIndex, 1)
                    break;
                default:
                    break;
            }
            //先去更新了dynamicData,然后导致renderData 的更新，进而重新渲染页面。
            setDynamicData(insert);
            setVisable("none");
            //然后改变了 controlData 中的数值
            getValue("rows",insert.length);
        }
    }

    //增减列
    function changeCol(how){
        return function(){
            let insert = renderHead.slice();
            switch (how) {
                case "after":
                    insert.splice(tdIndex + 1, 0, {key:uuidv4()});
                    break;
                case "front":
                    insert.splice(tdIndex, 0, {key:uuidv4()});
                    break;
                case "remove":
                    insert.splice(tdIndex, 1);
                    break;
                default:
                    break;
            }
            setDynamicHead(insert); //这里更新了 dynamic 所以可以正常展示。
            setVisable("none");
            getValue("cols",insert.length)
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
            
            console.log(dragableTable.scaleTheadArr)
            cellSize.width = newstWidthArr;
            cellSize.height = newstHeightArr
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
                                    onFocus={gitInitialHead}
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
                                                value={perObject[cell["title"]]} 
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
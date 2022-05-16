import * as React from "react"
import { useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import TableEdit from "./TableEdit"

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

    const {controlData,cellSize,colID,rowID,getColID,getRowID,renderHead,renderData, getCellSize, getRenderData, getRenderHead,getDynamicHead,getDynamicData,table_ref,changeColsCount,changeRowsCount} = props;
    const {b_top,b_right,b_bottom,b_left} = controlData.tbodyPadding;
    const {h_top,h_bottom} = controlData.theadPadding;
    const tableWidth = controlData.tableWidth;
    const reservedWidth = (b_left*1 + b_right*1) + "px";

    const [rightPanelDisplay, setRightPanelDisplay] = useState("none");
    const [tdIndex, setTdIndex] = useState(null)
    const [trIndex, setTrIndex] = useState(null)
    const rightPanel = useRef(null);
    
    //table 输入
    function changeTbodyValue(e){
        const {trIndex,tdIndex} = eventPosition(e);
        let insert = renderData.slice();
        insert[trIndex][renderHead[tdIndex]["colID"]] = e.target.value;
        getRenderData(insert);
        getDynamicData(insert);

    }

    function changeTheadValue(e){
        const {tdIndex} = eventPosition(e);
        let insertHead = renderHead.slice();
        insertHead[tdIndex]["title"] = e.target.value;
        getRenderHead(insertHead);
        getDynamicHead(insertHead)
    }
    
    //自定义右键菜单
    function forRight(e) {
        e.preventDefault()
        setRightPanelDisplay("block")
        //获取当前鼠标的坐标
        const clickX = e.clientX
        const clickY = e.clientY
        const {trIndex,tdIndex} = eventPosition(e);
        //为 右键菜单 标记了 refs 标签 (rightPanel)。这里引用并设置右键菜单的位置
        //（已经设置 ul 的 position 为 absolute ）。
        rightPanel.current.style.left = clickX + "px"
        rightPanel.current.style.top = clickY + "px"
        //更新当前事件的位置
        setTdIndex(tdIndex)
        setTrIndex(trIndex)
        //为 document 添加一个全局点击事件，用来隐藏右键菜单
        document.addEventListener("click",handleDocument)
    }

    //隐藏右键
    function handleDocument(){
        setRightPanelDisplay("none")
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
            changeRowsCount(insert.length,renderHead,insert)
            setRightPanelDisplay("none");
            getRowID(rowID + 1)
        }
    }

    //增减列
    function changeCol(how){
        return function(){
            let insert = renderHead.slice();
            switch (how) {
                case "after":
                    insert.splice(tdIndex + 1, 0, {key:uuidv4(),colID:colID+1});
                    break;
                case "front":
                    insert.splice(tdIndex, 0, {key:uuidv4(),colID:colID+1});
                    break;
                case "remove":
                    insert.splice(tdIndex, 1);
                    break;
                default:
                    break;
            }
            changeColsCount(insert.length,insert,renderData);
            setRightPanelDisplay("none");
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
            changeRowsCount(insert.length,renderHead,insert)
            setRightPanelDisplay("none");
            getRowID(rowID + 1)
        }
    }

    //复制列
    function duplicateCol(){
        return function(){
            let insert_Head = renderHead.slice();
            let insert_Data = renderData.slice();
            let copiedTitle = insert_Head[tdIndex].title;
            let newColID = colID + 1;

            insert_Head.splice(tdIndex + 1, 0, {title:copiedTitle,key:uuidv4(),colID:newColID});
            insert_Data.forEach((obj)=>{
                obj[newColID] = obj[insert_Head[tdIndex].colID]
            });

            changeColsCount(insert_Head.length,insert_Head,insert_Data)
            setRightPanelDisplay("none");
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
            changeRowsCount(insert.length,renderHead,insert)
            setRightPanelDisplay("none");
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

            changeColsCount(insert_Head.length,insert_Head,insert_Data)
            setRightPanelDisplay("none");
        }
    }

    //定义表格可拖动的原始值
    const [draggableCells, setDraggableCells] = useState({
        variableCellWidthArr:[],
        oldCellWidthArr:[],
        currentCellWidth:"",
        draggable:false,
        mousePositon:"",
        indexOfCurrentCell:""
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
                setDraggableCells({
                    variableCellWidthArr:mouseDowntheadArr,
                    oldCellWidthArr:oldCellWidthArr,
                    currentCellWidth:mouseDownCurrent.offsetWidth,
                    draggable:true,
                    mousePositon:event.clientX,
                    indexOfCurrentCell:mouseDownCurrentIndex,
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
        if(draggableCells.draggable === true){
    
            //x的变量等于当前鼠标的 offsetX 减去 mouseDown 时初次获取的鼠标位置
            const deltaX = event.clientX - draggableCells.mousePositon;

            //有多少个需要改变宽度的单元格? 需要改变宽度的单元格数量是鼠标事件序号之后的所有单元格
            const deltaCount = draggableCells.variableCellWidthArr.length - 1 - draggableCells.indexOfCurrentCell;

            //基础增量，每一个单元格增加的量：deltaX 减去 除不净（deltaX % 要改变宽度的单元格数量）的量，然后再除以要改变宽度的单元格数量。
            const cellDeltaX = (deltaX - deltaX % deltaCount)/deltaCount;
                      
            for(let i=0;i<draggableCells.variableCellWidthArr.length;i++){
                if(i < draggableCells.indexOfCurrentCell){
                    draggableCells.variableCellWidthArr[i].style.width = draggableCells.oldCellWidthArr[i] + "px"
                }else if(i === draggableCells.indexOfCurrentCell){
                    draggableCells.variableCellWidthArr[i].style.width = draggableCells.currentCellWidth + deltaX + "px";
                }else if(i === currentIndex + 1){
                    draggableCells.variableCellWidthArr[i].style.width = draggableCells.oldCellWidthArr[i] - cellDeltaX - deltaX % deltaCount + "px"
                }else{
                    draggableCells.variableCellWidthArr[i].style.width = draggableCells.oldCellWidthArr[i] - cellDeltaX + "px"
                }
            }
           
        }
    }
    
    //这里导致 width.length 为 0
    function onMouseUp(event){
        if(event.target.tagName === "TH"){
            setDraggableCells({...draggableCells,draggable:false});
            event.target.style.cursor = "default";
            let newstWidthArr = [];
            let newstHeightArr = [];
            let cellSize = {};
        
            for(let i=0;i<draggableCells.variableCellWidthArr.length;i++){
                newstWidthArr.push(draggableCells.variableCellWidthArr[i].offsetWidth)
                newstHeightArr.push(draggableCells.variableCellWidthArr[i].offsetHeight*1)
            }
            
            cellSize.width = newstWidthArr;
            cellSize.height = newstHeightArr;
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
                    display={rightPanelDisplay}
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
                ref = {table_ref}
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
                                                backgroundColor:controlData.fill.intervalColor !== "" && rowIndex%2 === 0 ? controlData.fill.intervalColor : controlData.fill.basicColor,
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
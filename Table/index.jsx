import * as React from "react"
import { useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import TableEdit from "./TableEdit"

import styles from "./index.module.less"

function getOffsetSize(e) {
    const element = e.currentTarget;
    return {
        offsetTop:element.offsetTop,
        offsetLeft:element.offsetLeft,
        offsetWidth:element.offsetWidth,
        offsetHeight:element.offsetHeight
    }
}

export default function Table(props) {

    const {controlData,cellSize,colID,rowID,getColID,getRowID,renderHead,renderData, getCellSize, getRenderData, getRenderHead,getDynamicHead,getDynamicData,table_ref,changeColsCount,changeRowsCount,
        trIndex,tdIndex,lastSelectedTdIndex,cellMarker_first,cellMarker_all,getTrIndex,getTdIndex,getLastSelectedTrIndex,getLastSelectedTdIndex,getCellMarker_first,getCellMarker_all,clipboard
    } = props;
    const {b_top,b_right,b_bottom,b_left} = controlData.tbodyPadding;
    const {h_top,h_bottom} = controlData.theadPadding;
    const tableWidth = controlData.tableWidth;
    const reservedWidth = (b_left*1 + b_right*1) + "px";
    
    const [rightPanelDisplay, setRightPanelDisplay] = useState("none");

    const rightPanel = useRef(null);
    const cellMarker = useRef(null);

    //获取当前事件的位置
    function eventPosition(e) {

        let currentTd = e.target.tagName === "TD" || e.target.tagName === "TH" ? e.target : e.target.parentNode;
        let currentTr = currentTd.parentNode;

        let tds = currentTr.childNodes
        // let trs = currentTr.parentNode.childNodes
        let trs = table_ref.current.rows;

        let tdIndex = Array.from(tds).indexOf(currentTd);
        let trIndex = Array.from(trs).indexOf(currentTr);
       
        return {"tdIndex":tdIndex,"trIndex":trIndex}
    }

    function keyDown(e) {
        const {trIndex,tdIndex} = eventPosition(e);
        let table = table_ref.current.childNodes;
        let thead = Array.from(table).find((element) => element.tagName === "THEAD");
        let tbody = Array.from(table).find((element) => element.tagName === "TBODY");

        let maxRows = renderData.length
        let maxCols = renderHead.length

        //目标对象是 INPUT
        if(e.target.tagName === "INPUT"){
            if(e.keyCode === 13){
                let cell;

                switch (e.target.parentNode.tagName) {
                    //不同位置的跳跃情况
                    case "TH":
                        cell = tbody.rows[0].childNodes[tdIndex];
                        break;
                    case "TD":
                        if(trIndex === maxRows && tdIndex === maxCols - 1){
                            cell = thead.rows[0].childNodes[0];
                        }else if(trIndex === maxRows){
                            cell = thead.rows[0].childNodes[tdIndex+1];
                        }else{
                            cell = tbody.rows[trIndex].childNodes[tdIndex];
                        }
                        break;
                    default:
                        break;
                }
                cell.focus();
            }
        //点击对象是 TD 或者 TH
        }else if(e.target.tagName === "TD" || e.target.tagName === "TH"){

            if(e.keyCode === 9 || e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40){
                //阻止 tab 的自动聚焦到下一个聚焦点。但是 input 中没有执行此操作，所以 input 点击 tab 可以顺利跳到下一个聚焦点。
                e.preventDefault();
                let cell;
                switch (e.target.tagName) {
                    //不同位置的跳跃情况
                    case "TH":
                        if(e.keyCode === 9){
                            if(tdIndex === maxCols -1){
                                cell = tbody.rows[0].childNodes[0]
                            }else{
                                cell = thead.rows[0].childNodes[tdIndex+1];
                            }
                        }else if(e.keyCode === 37 && tdIndex !== 0){
                            cell = thead.rows[0].childNodes[tdIndex-1];
                        }else if(e.keyCode === 39 && tdIndex !== maxCols - 1){
                            cell = thead.rows[0].childNodes[tdIndex+1];
                        }else if(e.keyCode === 40){
                            cell = tbody.rows[0].childNodes[tdIndex]
                        }else{
                            return;
                        }
                        break;
                    case "TD":
                        if(e.keyCode === 9){
                            if(trIndex === maxRows && tdIndex === maxCols - 1){
                                cell = thead.rows[0].childNodes[0];
                            }else if(tdIndex === maxCols - 1){
                                cell = tbody.rows[trIndex].childNodes[0];
                            }else{
                                cell = tbody.rows[trIndex-1].childNodes[tdIndex+1];
                            }
                        }else if(e.keyCode === 37 && tdIndex !== 0){
                            cell = tbody.rows[trIndex - 1].childNodes[tdIndex-1];
                        }else if(e.keyCode === 38){
                            cell = trIndex===1 ? thead.rows[0].childNodes[tdIndex] : tbody.rows[trIndex-2].childNodes[tdIndex]
                        }else if(e.keyCode === 39 && tdIndex !== maxCols - 1){
                            cell = tbody.rows[trIndex - 1].childNodes[tdIndex + 1];
                        }else if(e.keyCode === 40 && trIndex !== maxRows){
                            cell = tbody.rows[trIndex].childNodes[tdIndex];
                        }else {
                            return;
                        }
                        break;
                    default:
                        break;
                }
                cell.focus();
            }else if(e.keyCode !== 91 && 
                    e.keyCode !== 93 && 
                    e.keyCode !== 17 && 
                    e.keyCode !== 18 && 
                    e.keyCode !== 16 && 
                    e.keyCode !== 20 && 
                    e.keyCode !== 27 && 
                    e.keyCode !== 37 && 
                    e.keyCode !== 38 && 
                    e.keyCode !== 39 && 
                    e.keyCode !== 40
                ){
                    e.target.childNodes[0].disabled = false;
                    e.target.childNodes[0].focus();
                    e.target.childNodes[0].select();
                }
        }else {
            return;
        }
    }

    function focus_cell(e) {
        const cell = e.currentTarget;
        getCellMarker_all({
            offsetLeft:cell.offsetLeft,
            offsetTop:cell.offsetTop,
            offsetWidth:cell.offsetWidth,
            offsetHeight:cell.offsetHeight
        })
    }

    const [dragSelectCells,setDragSelectCells] = useState(false)

    function selectCells_first(e){
        if(e.button !== 0) return;
        const {trIndex,tdIndex} = eventPosition(e);
        const {offsetTop,offsetLeft,offsetWidth,offsetHeight} = getOffsetSize(e);
        setDragSelectCells(true);
        getCellMarker_first({            
            offsetTop:offsetTop,
            offsetLeft:offsetLeft,
            offsetWidth:offsetWidth,
            offsetHeight:offsetHeight
        });
        getCellMarker_all({            
            offsetTop:offsetTop,
            offsetLeft:offsetLeft,
            offsetWidth:offsetWidth,
            offsetHeight:offsetHeight
        });
        getTdIndex(tdIndex);
        getTrIndex(trIndex);
        getLastSelectedTdIndex(tdIndex);
        getLastSelectedTrIndex(trIndex);
    }

    function selectCells_another(e) {
        const {trIndex,tdIndex} = eventPosition(e);
        const {offsetTop,offsetLeft,offsetWidth,offsetHeight} = getOffsetSize(e)

        if(dragSelectCells){
            let width,height,originX,originY;

            originX = cellMarker_first.offsetLeft >= offsetLeft ? offsetLeft : cellMarker_first.offsetLeft;
            originY = cellMarker_first.offsetTop >= offsetTop ? offsetTop : cellMarker_first.offsetTop;
            width = cellMarker_first.offsetLeft >= offsetLeft ? Math.abs(cellMarker_first.offsetLeft - offsetLeft) + cellMarker_first.offsetWidth : Math.abs(cellMarker_first.offsetLeft - offsetLeft) + offsetWidth;
            height = cellMarker_first.offsetTop >= offsetTop ? Math.abs(cellMarker_first.offsetTop - offsetTop) + cellMarker_first.offsetHeight : Math.abs(cellMarker_first.offsetTop - offsetTop) + offsetHeight;

            getCellMarker_all({            
                offsetTop:originY,
                offsetLeft:originX,
                offsetWidth:width,
                offsetHeight:height
            });

            getLastSelectedTrIndex(trIndex);
            getLastSelectedTdIndex(tdIndex);
        }
    }

    function blur_inputBox(e) {
        e.currentTarget.disabled = true
    }

    function activateInputBox(e) {
        e.currentTarget.childNodes[0].disabled = false;
        e.currentTarget.childNodes[0].focus();
        
    }
    
    //table 输入
    function changeTbodyValue(e){
        const {trIndex,tdIndex} = eventPosition(e);
        let insert = renderData.slice();
        insert[trIndex-1][renderHead[tdIndex]["colID"]] = e.target.value;
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
        getTdIndex(tdIndex)
        getTrIndex(trIndex)
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
                    insert.splice(trIndex, 0, {key:uuidv4(),rowID:rowID+1});
                    break;
                case "front":
                    insert.splice(trIndex-1, 0, {key:uuidv4(),rowID:rowID+1});
                    break;
                case "remove":
                    insert.splice(trIndex-1, 1)
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
        if(event.target.tagName === "LI"){
            //获取鼠标按下获取到的那个元素
            let current = event.target;
            //获取 thead 中的所有子元素
            let lists = current.parentNode.childNodes;
            //将获取的 thead 中的所有子元素放入数组
            let listsArr = Array.from(lists);
            //获取当前单元格的序号
            let mouseDownCurrentIndex = listsArr.indexOf(current)

            //如果不是最后一个单元格，且鼠标位置在单元格右侧侧 8 像素范围内
            if(mouseDownCurrentIndex !== listsArr.length-1 && event.nativeEvent.offsetX > current.offsetWidth - 8){
                
                //鼠标手势变为拖动手势
                current.style.cursor = "col-resize";
                
                //记录之前的单元格宽度
                let oldCellWidthArr = [];
                for(let i=0;i<listsArr.length;i++){
                    oldCellWidthArr.push(listsArr[i].offsetWidth)
                }
                
                //更新状态
                setDraggableCells({
                    variableCellWidthArr:listsArr,
                    oldCellWidthArr:oldCellWidthArr,
                    currentCellWidth:current.offsetWidth,
                    draggable:true,
                    mousePositon:event.clientX,
                    indexOfCurrentCell:mouseDownCurrentIndex,
                });
            }
        }
    }
    
    //鼠标移动的时候
    function onMouseMove(event){
        let current, lists, listsArr, currentIndex
        if(event.target.tagName === "LI"){
            current = event.target
            lists = current.parentNode.childNodes;
            listsArr = Array.from(lists)
            currentIndex = listsArr.indexOf(current);
            
            //同样的要去检测鼠标位置以及他的事件对象
            if(currentIndex !== listsArr.length-1 && event.nativeEvent.offsetX > current.offsetWidth - 8){
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
        if(event.target.tagName === "LI"){
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
            getCellSize(cellSize);

            if(tdIndex === null && lastSelectedTdIndex === null) return;

            let first = Array.from(event.target.parentNode.childNodes)[tdIndex]
            let last = Array.from(event.target.parentNode.childNodes)[lastSelectedTdIndex]
            if(tdIndex === lastSelectedTdIndex){
                getCellMarker_all({
                    ...cellMarker_all,
                    offsetLeft:first.offsetLeft-24,
                    offsetWidth:first.offsetWidth
                })
            }else{
                let width,originX;
                originX = first.offsetLeft >= last.offsetLeft ? last.offsetLeft : first.offsetLeft;
                width = Math.abs(first.offsetLeft - last.offsetLeft) + (first.offsetLeft >= last.offsetLeft ? first.offsetWidth :  last.offsetWidth);
                getCellMarker_all({      
                    ...cellMarker_all,      
                    offsetLeft:originX-24,
                    offsetWidth:width,
                });
            }
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
        <div className={styles.leftPart}>
            <div className={styles.rightPanel} ref={rightPanel} >
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
            <ul 
                style={{
                    width:cellSize.width.reduce((a,b)=>a+b,0)
                }}
                onMouseDown = {onMouseDown}
                onMouseMove = {onMouseMove}
                onMouseUp={onMouseUp}
                className={styles.colID}
            >
                {renderHead.map((cell,index)=>{
                    return (
                        <li 
                            key = {cell["key"] + "li"}
                            style = {{
                                width:cellSize.width.length ? cellSize.width[index] : defaultCellWidth,
                            }}
                        >
                            {cell["serialNumber"]}
                        </li>
                    )
                })}
            </ul>
            <div className={styles.tableContainer} >
                <div 
                    className={styles.mark} 
                    ref = {cellMarker}
                    style={{
                        pointerEvents:"none",
                        border:"2px solid #2B7EFF",
                        left:cellMarker_all.offsetLeft + "px",
                        top:cellMarker_all.offsetTop + "px",
                        width:cellMarker_all.offsetWidth + "px",
                        height:cellMarker_all.offsetHeight + "px",
                    }}
                >

                </div>
                <table
                    ref = {table_ref}
                    style={{
                        width:cellSize.width.reduce((a,b)=>a+b,0)
                    }}
                >
                    <colgroup>
                        {renderHead.map(()=>{
                            return (<col key={uuidv4()}></col>) 
                        })}
                    </colgroup>
                    <thead>
                        <tr>
                            {renderHead.map((cell,index) => {
                                return <th 
                                    tabIndex={0}
                                    onKeyDown = {(e)=>keyDown(e)}
                                    onMouseEnter={selectCells_another}
                                    onMouseDown={selectCells_first}
                                    onFocus = {focus_cell}
                                    onMouseUp={
                                        ()=>{
                                            setDragSelectCells(false)
                                        } 
                                    }
                                    onDoubleClick = {activateInputBox}
                                    onPaste={clipboard}
                                    key={cell["key"]}
                                    style={{
                                        outline:"none",
                                        width:cellSize.width.length ? cellSize.width[index] : defaultCellWidth,
                                        backgroundColor:controlData.theadFill.basicColor,
                                        borderRight:controlData.border.intervalColor !== "" && index !== renderHead.length-1 ? `1px solid ${controlData.border.intervalColor}`: "none",
                                        borderBottom:`1px solid ${controlData.border.basicColor}`
                                    }}
                                >
                                    <input 
                                        disabled = {true}
                                        type="text" 
                                        value={cell["title"]} 
                                        onKeyDown={(e)=>keyDown(e)}
                                        onChange={changeTheadValue}
                                        onBlur = {blur_inputBox}
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
                                                tabIndex={0}
                                                onKeyDown = {(e)=>keyDown(e)}
                                                // onKeyDown = {(e)=>{console.log(e.keyCode)}}
                                                onFocus={focus_cell}
                                                onMouseEnter={selectCells_another}
                                                onMouseDown={selectCells_first}
                                                onMouseUp={
                                                    ()=>{
                                                        setDragSelectCells(false)
                                                    }
                                                }
                                                onDoubleClick = {activateInputBox}
                                                onPaste={clipboard}
                                                style={{
                                                    //隔行换色开启，且行数为奇数时，填充intervalColor, 否则填充 basicColor
                                                    outline:"none",
                                                    backgroundColor:controlData.fill.intervalColor !== "" && rowIndex%2 === 0 ? controlData.fill.intervalColor : controlData.fill.basicColor,
                                                    borderRight:controlData.border.intervalColor !== "" && cellIndex !== renderHead.length-1 ? `1px solid ${controlData.border.intervalColor}`: "none",
                                                    borderBottom:`1px solid ${controlData.border.basicColor}`
                                                }}
                                                onContextMenu={forRight}
                                                key={perObject["key"]+cell["key"]}
                                            >
                                                <input type="text" 
                                                    disabled = {true}
                                                    onBlur = {blur_inputBox}
                                                    // onMouseDown={preventDefault}
                                                    onKeyDown={(e)=>keyDown(e)}
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
        </div>
    )
}
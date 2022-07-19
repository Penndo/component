import * as React from "react";
import {useRef, useState } from "react";

import {createIDB, getAllValue} from "../Public/IDB";
import { shearData,recalculate_CellSize } from "../Public/Tools";
import Table from "../Table";
import ConstrolSlider from "../ConstrolSlider";
import { originControlData, originCellSize, originHead, originData } from "../Public/originContant";

import styles from "./index.module.less";

const defaultStoreName = "defaultStore";
const defaultHistoryName = "historyStore";

export default function App(){
    const initialInformation = {
        controlData:originControlData,
        renderData:originData,
        renderHead:originHead,
        cellSize:originCellSize,
        dynamicData:originData,
        dynamicHead:originHead,
        defaultStorageData:[],
        historyStorageData:[{id:1,history:""}]
    }

    const initialCellMarker = {
        offsetLeft:-100,
        offsetTop:-100,
        offsetWidth:0,
        offsetHeight:0
    }

    function reducer(state, action) {
        switch (action.type) {
            case "controlData":
                return {
                    ...state,
                    controlData:action.value
                }
            case "renderData":
                return {
                    ...state,
                    renderData:action.value
                }
            case "renderHead":
                return {
                    ...state,
                    renderHead:action.value
                }
            case "cellSize":
                return {
                    ...state,
                    cellSize:action.value
                }
            case "dynamicHead":
                return {
                    ...state,
                    dynamicHead:action.value
                }
            case "dynamicData":
                return {
                    ...state,
                    dynamicData:action.value
                }
            case "all":
                return {
                    ...action.value
                }
            default:
                return state
        }
    }

    function reducer_cellMarker(state, action) {
        switch (action.type) {
            case "top":
                return {
                    ...state,
                    offsetTop:action.value
                }
            case "left":
                return {
                    ...state,
                    offsetLeft:action.value
                }
            case "width":
                return {
                    ...state,
                    offsetWidth:action.value
                }
            case "height":
                return {
                    ...state,
                    offsetHeight:action.value
                }
            case "all":
                return {
                    ...action.value
                }
            default:
                return state
            }
    }

    const table_ref = useRef(null);

    const [information, dispatch] = React.useReducer(reducer, initialInformation)
    const [cellMarker_all, dispatch_cellMarker] = React.useReducer(reducer_cellMarker, initialCellMarker)
    const {controlData,renderData,renderHead,cellSize,dynamicData,dynamicHead,defaultStorageData,historyStorageData} = information
    const [headerIndependentStyle, setHeaderIndependentStyle] = useState(false);
    const [lastPickedColor,setLastPickedColor] = useState(controlData.fill.basicColor);
    const [fillInterval_usedCount, setFillInterval_usedCount] = React.useState(1);//隔行换色的开启次数，作为其key，每重新开启一次，重新创建一个新的组件
    const [colID, setColID] = useState(maxID(dynamicHead,"colID"))
    const [rowID, setRowID] = useState(maxID(dynamicData,"rowID"))

    const [tdIndex, setTdIndex] = useState(null)
    const [trIndex, setTrIndex] = useState(null)
    const [lastSelectedTdIndex, setLastSelectedTdIndex] = useState(null)
    const [lastSelectedTrIndex, setLastSelectedTrIndex] = useState(null)
    // console.log(trIndex)

    const [cellMarker_first, setCellMarker_first] = useState({
        offsetLeft:0,
        offsetTop:0,
        offsetWidth:0,
        offsetHeight:0
    })

    function getCellSize(data) {
        dispatch({type:"cellSize",value:data})
    }

    function getDynamicData(data) {
        dispatch({type:"dynamicData",value:data})
    }

    function getDynamicHead(data) {
        dispatch({type:"dynamicHead",value:data})
    }

    function getRenderData(data){
        dispatch({type:"renderData",value:data})
    }

    function getRenderHead(data) {
        dispatch({type:"renderHead",value:data})
    }

    function syncBodyStyleToHeader() {
        setHeaderIndependentStyle(true)
    }

    function getLastPickedColor(value) {
        setLastPickedColor(value)
    }

    function refreshInterval_usedCount(value){
        setFillInterval_usedCount(value)
    }

    function getColID(colID) {
        setColID(colID)
    }

    function getRowID(rowID) {
        setRowID(rowID)
    }

    function getTrIndex(trIndex) {
        setTrIndex(trIndex)
    }

    function getTdIndex(tdIndex) {
        setTdIndex(tdIndex)
    }

    function getLastSelectedTdIndex(tdIndex) {
        setLastSelectedTdIndex(tdIndex)
    }

    function getLastSelectedTrIndex(trIndex) {
        setLastSelectedTrIndex(trIndex)
    }

    function getCellMarker_first(obj) {
        setCellMarker_first(obj)
    }

    function getCellMarker_all(obj) {
        dispatch_cellMarker({type:"all",value:obj})
    }

    function maxID(data,name){
        let IDArr = [];
        for(let i=0;i<data.length;i++){
            IDArr.push(data[i][name])
        };
        return Math.max(...IDArr)
    }

    function cellMarkerPosition_top(arr) {
        return arr.slice(0,Math.min(trIndex,lastSelectedTrIndex)).reduce((a,b)=>a+b,0)
    }

    function cellMarkerPosition_height(arr) {
        return arr.slice(Math.min(trIndex,lastSelectedTrIndex),Math.max(trIndex,lastSelectedTrIndex) + 1).reduce((a,b) => a+b,0)
    }

    function changeFontSize() {
        console.log(219)
        const ro = new ResizeObserver( entries => {
            let newCellSize = {};
            let heights = [];
            for (let entry of entries) {
                const rows = entry.target.rows;
                for(let row of rows){
                    heights.push(row.clientHeight);
                }
                console.log(229)
            }
            newCellSize.height = heights
            dispatch_cellMarker({type:"top",value:cellMarkerPosition_top(heights)})
            dispatch_cellMarker({type:"height",value:cellMarkerPosition_height(heights)})
        });
        ro.observe(table_ref.current);
        window.setTimeout(()=>{
            ro.unobserve(table_ref.current);//取消事件监听
        },0)
    }

    function resizeCellMarker(value,preValue,typeName,propertyName) {
        let dif = value - preValue;
        if(typeName === "tableAmount"){
            if(propertyName === "cols"){
                changeColsCount(value,dynamicHead,dynamicData)
            }else{
                changeRowsCount(value,dynamicHead,dynamicData)
            }
        }
        else if(typeName === "tableWidth"){
            const count = controlData.tableAmount.cols,preCount = controlData.tableAmount.cols;
            let newCellSize = recalculate_CellSize(count,preCount,value,cellSize)
            console.log(dif)
            dispatch_cellMarker({type:"left",value:newCellSize.width.slice(0,Math.min(tdIndex,lastSelectedTdIndex)).reduce((a,b)=>a+b,0)})
            dispatch_cellMarker({type:"width",value:newCellSize.width.slice(Math.min(tdIndex,lastSelectedTdIndex),Math.max(tdIndex,lastSelectedTdIndex) + 1).reduce((a,b) => a+b,0)})

            getCellSize({...cellSize,...newCellSize})
        }else if(trIndex === 0 || lastSelectedTrIndex === 0){//焦点包含表头
            if(headerIndependentStyle && typeName === "theadPadding"){
                dispatch_cellMarker({type:"height",value:cellMarker_all.offsetHeight + dif})

            }else if(headerIndependentStyle && typeName === "tbodyPadding"){
                dispatch_cellMarker({type:"height",value:cellMarker_all.offsetHeight + dif * Math.abs(lastSelectedTrIndex - trIndex)})

            }else{
                dispatch_cellMarker({type:"height",value:cellMarker_all.offsetHeight + dif * (Math.abs(lastSelectedTrIndex - trIndex)+1)})
            }
        }else{
            if(headerIndependentStyle && typeName === "theadPadding"){
                dispatch_cellMarker({type:"top",value:cellMarker_all.offsetTop + dif})

            }else if(headerIndependentStyle && typeName === "tbodyPadding"){
                dispatch_cellMarker({type:"top",value:cellMarker_all.offsetTop + dif * (Math.min(lastSelectedTrIndex, trIndex) - 1)})
                dispatch_cellMarker({type:"height",value:cellMarker_all.offsetHeight + dif * (Math.abs(lastSelectedTrIndex - trIndex) + 1)})

            }else{
                dispatch_cellMarker({type:"top",value:cellMarker_all.offsetTop + dif * Math.min(lastSelectedTrIndex, trIndex)})
                dispatch_cellMarker({type:"height",value:cellMarker_all.offsetHeight + dif * (Math.abs(lastSelectedTrIndex - trIndex) + 1)})

            }
        }
    }

    //从模板更新页面数据
    function refreshDataFromComponent(){
        createIDB().then((db)=>{
            const defaultStorageData_result = Promise.resolve(getAllValue(db,defaultStoreName));
            const historyStorageData_result = Promise.resolve(getAllValue(db,defaultHistoryName));
            Promise.all([defaultStorageData_result,historyStorageData_result]).then((values)=>{
                
                const informationList = values[0];
                const selectes = values[1];
                if(!informationList.length) return false;
                const selectedName = selectes[0].history;
                let data = null;
                
                for(let i=0; i<informationList.length; i++){
                    if(informationList[i].title === selectedName){
                        data = informationList[i].information;
                        break;
                    }
                }

                dispatch({type:"all",value:{
                    controlData:data.controlData,
                    renderData:data.renderData,
                    renderHead:data.renderHead,
                    cellSize:data.cellSize,
                    dynamicData:data.renderData,
                    dynamicHead:data.renderHead,
                    defaultStorageData:informationList,
                    historyStorageData:selectes
                }})
                
                const {basicColor,intervalColor,switchState} = data.controlData.fill
                if(switchState === true){
                    setLastPickedColor(intervalColor === "" ? basicColor : intervalColor)
                }else if(switchState === false){
                    setLastPickedColor(basicColor)
                }

                setHeaderIndependentStyle(false)

            })
        })
    }

    function getControlData(name, data) {
        //用来判断表头样式和表格样式是否全等。如果不全等就让样式独立编辑。
        const headerIndependentStyle_condition = 
            controlData.tbodyPadding.b_top !== controlData.theadPadding.h_top || 
            controlData.tbodyPadding.b_bottom !== controlData.theadPadding.h_bottom ||
            controlData.fill.basicColor !== controlData.theadFill.basicColor ||
            controlData.textStyle.basicColor !== controlData.theadTextStyle.basicColor ||
            controlData.textStyle.fontSize !== controlData.theadTextStyle.fontSize ||
            controlData.textStyle.fontWeight !== controlData.theadTextStyle.fontWeight;

        if(headerIndependentStyle_condition){
            setHeaderIndependentStyle(true)
        }

        //同步表格样式数据至表头
        function syncControlData() {
            let syncData = {}
            if(!headerIndependentStyle){       
                switch (name) {
                    case "tbodyPadding":
                        const {b_top,b_bottom} = data.tbodyPadding
                        syncData = {
                            theadPadding:{
                                h_top:b_top,
                                h_bottom:b_bottom
                            }
                        }
                        break;
                    case "fill":
                        syncData = {
                            theadFill:{
                                basicColor:data.fill.basicColor
                            }
                        };
                        break;
                    case "textStyle":
                        const {basicColor,fontSize,fontWeight} = data.textStyle;
                        syncData = {
                            theadTextStyle:{
                                basicColor:basicColor,
                                fontSize:fontSize,
                                fontWeight:fontWeight
                            }
                        };
                        break;
                    default:
                        break;
                }       
            };
            return {...syncData,...data}
        }
        dispatch({type:"controlData",value:{
            ...controlData,...syncControlData()
        }})
    }

    function changeColsCount(count,renderHead,renderData){

        let readyRenderHead = shearData(count,renderHead,colID,"colID",getColID);
        let readyRenderData = renderData.slice();

        let mergedHead = [];
        for(let i=0;i<readyRenderHead.length;i++){
            let col = {};
            readyRenderHead[i]["serialNumber"] = i;
            col["title"] = "";
            Object.assign(col, readyRenderHead[i]);
            mergedHead.push(col);
        };

        let mergedData = [];
        for(let i=0;i<readyRenderData.length;i++){
            let row = {};
            for(let j=0;j<readyRenderHead.length;j++){
                row[readyRenderHead[j]["colID"]] = "";
            }
            Object.assign(row, readyRenderData[i]);
            mergedData.push(row);
        };

        //处理掉行数据中多余的属性内容
        for(let i=0;i<mergedData.length;i++){
            for(let property in mergedData[i]){
                if(property !== "key" && property !== "rowID"){
                    let leave = false;
                    for(let j=0;j<mergedHead.length;j++){
                        if(property === mergedHead[j].colID.toString()){
                            leave = false;
                            break;
                        }else{
                            leave = true;
                        }
                    }
                    if(leave){
                        delete mergedData[i][property];
                    }
                }
            }
        }
        const preCount = controlData.tableAmount.cols;
        const tableWidth = controlData.tableWidth;
        let newCellSize = recalculate_CellSize(count,preCount,tableWidth,cellSize);
        dispatch({type:"all",value:{
            ...information,
            renderHead:mergedHead,
            renderData:mergedData.slice(0,controlData.tableAmount.rows),
            dynamicData:count >= renderHead.length ? mergedData :information.dynamicData,
            dynamicHead:count >= renderHead.length ? mergedHead :information.dynamicHead,
            controlData:{...controlData,tableAmount:{...controlData.tableAmount,cols:count}},
            cellSize:{...cellSize,...newCellSize}
        }})

        let cellMarker_all_left = null,cellMarker_all_width = null;

        //重新设置高亮框的左侧
        if(Math.min(tdIndex,lastSelectedTdIndex) + 1 > count){
            cellMarker_all_left = -100;
        }else{
            cellMarker_all_left = newCellSize.width.slice(0,Math.min(tdIndex,lastSelectedTdIndex)).reduce((a,b)=>a+b,0);
        }
        //重新设置高亮框的宽度
        if(Math.min(tdIndex,lastSelectedTdIndex) + 1 > count){
            cellMarker_all_width = 0;
        }else if((Math.max(tdIndex,lastSelectedTdIndex) + 1) < count){
            cellMarker_all_width = newCellSize.width.slice(Math.min(tdIndex,lastSelectedTdIndex),Math.max(tdIndex,lastSelectedTdIndex)+1).reduce((a,b)=>a+b,0);
        }else{
            cellMarker_all_width = newCellSize.width.slice(Math.min(tdIndex,lastSelectedTdIndex),count+1).reduce((a,b)=>a+b,0);
        }
        dispatch_cellMarker({type:"left",value:cellMarker_all_left})
        dispatch_cellMarker({type:"width",value:cellMarker_all_width})
        // setCellMarker_all({
        //     ...cellMarker_all,
        //     offsetLeft:cellMarker_all_left,
        //     offsetWidth:cellMarker_all_width
        // })
    }

    function changeRowsCount(count,renderHead,renderData){
        let readyRenderHead = renderHead.slice();
        let readyRenderData = shearData(count,renderData,rowID,"rowID",getRowID);

        let mergedData = [];
        for(let i=0;i<readyRenderData.length;i++){
            let row = {};
            for(let j=0;j<readyRenderHead.length;j++){
                row[readyRenderHead[j]["colID"]] = "";
            }
            Object.assign(row, readyRenderData[i]);
            mergedData.push(row);
        };

        dispatch({type:"all",value:{
            ...information,
            dynamicData:count >= renderData.length ? mergedData : information.dynamicData,
            renderData:mergedData,
            controlData:{...controlData,tableAmount:{...controlData.tableAmount,rows:count}}
        }})

        let cellMarker_all_height = null;
        if(Math.min(trIndex,lastSelectedTrIndex) > count){
            cellMarker_all_height = 0;
        }else if(Math.max(trIndex,lastSelectedTrIndex) < count){
            cellMarker_all_height = cellMarker_all.offsetHeight;
        }else{
            cellMarker_all_height = cellMarker_all.offsetHeight * ((count - Math.min(trIndex,lastSelectedTrIndex) + 1)/(Math.max(trIndex,lastSelectedTrIndex) - Math.min(trIndex,lastSelectedTrIndex) + 1));
        }
        dispatch_cellMarker({type:"top",value:trIndex+1 > count ? -100 : cellMarker_all.offsetTop})
        dispatch_cellMarker({type:"height",value:cellMarker_all_height})
        // setCellMarker_all({
        //     ...cellMarker_all,
        //     offsetTop:trIndex+1 > count ? -100 : cellMarker_all.offsetTop,
        //     offsetHeight:cellMarker_all_height
        // })
    }

    //切换模板更新初始数据
    function switchTemplate(){
        setFillInterval_usedCount(1)
        refreshDataFromComponent()
    }

    function backToInitialState(){
        createIDB().then((db)=>{
            const defaultStorageData_result = Promise.resolve(getAllValue(db,defaultStoreName));
            const historyStorageData_result = Promise.resolve(getAllValue(db,defaultHistoryName));
            Promise.all([defaultStorageData_result,historyStorageData_result]).then((values)=>{
                dispatch({type:"all",value:{
                    controlData:originControlData,
                    renderData:originData,
                    renderHead:originHead,
                    cellSize:originCellSize,
                    dynamicData:originData,
                    dynamicHead:originHead,
                    defaultStorageData:values[0],
                    historyStorageData:values[1]
                }})
            })
        })
    }

    //页面加载时，加载一次本地存储的数据
    React.useEffect(()=>{
        refreshDataFromComponent();
    },[])

    function clipboard(e) {
        console.log(e.target.tagName)
        e.preventDefault();
        let newRenderHead = renderHead.slice();
        let newRenderData = renderData.slice();

        let minTdIndex = Math.min(tdIndex,lastSelectedTdIndex);
        let minTrIndex = Math.min(trIndex,lastSelectedTrIndex);
        let rows = controlData.tableAmount.rows;
        let cols = controlData.tableAmount.cols;
        let copiedRow = [];
        let copiedTable = [];

        navigator.clipboard.readText().then(
            (clipText) => {
                copiedRow = clipText.split("\n").filter(word => word !== "");
                console.log(clipText,copiedRow)
                for(let i=0;i<copiedRow.length;i++){
                    copiedTable.push(copiedRow[i].split("\t"));
                }
                //限制循环次数
                let textRows = copiedRow.length;
                let textCols = copiedTable[0].length;
                let rowLoopTimes = Math.min(textRows,rows-minTrIndex+1); //因为这里的 rows 数量不包含表头，所以要 +1
                let colLoopTimes = Math.min(textCols,cols-minTdIndex);

                console.log(rowLoopTimes,colLoopTimes)
                if(tdIndex === null || trIndex === null){
                    alert("请选择要粘贴的位置");
                    return;
                }
                if(minTrIndex === 0){ //表头参与
                    //更新表头数据
                    for(let k=0;k<colLoopTimes;k++){
                        newRenderHead[minTdIndex+k]["title"] = copiedTable[0][k]
                    }
                    //更新表格数据
                    for(let j=0;j<rowLoopTimes-1;j++){
                        for(let k=0;k<colLoopTimes;k++){
                            newRenderData[j][newRenderHead[minTdIndex + k]["colID"]] = copiedTable[j+1][k]
                        }
                    }
                }else{ //表头不参与
                    for(let j=0;j<rowLoopTimes;j++){
                        for(let k=0;k<colLoopTimes;k++){
                            newRenderData[minTrIndex+j-1][newRenderHead[minTdIndex + k]["colID"]] = copiedTable[j][k]
                        }
                    }
                }
                getRenderHead(newRenderHead);
                getRenderData(newRenderData);
            }
        );

    }

    return (
        <div className={styles["container"]}>
            <Table 
                trIndex = {trIndex}
                tdIndex = {tdIndex}
                lastSelectedTdIndex = {lastSelectedTdIndex}
                cellMarker_first = {cellMarker_first}
                cellMarker_all = {cellMarker_all}
                getTrIndex = {getTrIndex}
                getTdIndex = {getTdIndex}
                getLastSelectedTrIndex = {getLastSelectedTrIndex}
                getLastSelectedTdIndex = {getLastSelectedTdIndex}
                getCellMarker_first = {getCellMarker_first}
                getCellMarker_all = {getCellMarker_all}

                clipboard={clipboard}
                changeColsCount = {changeColsCount}
                changeRowsCount = {changeRowsCount}
                table_ref = {table_ref}
                colID={colID}
                rowID={rowID}
                getColID={getColID}
                getRowID={getRowID}
                dynamicData={dynamicData}
                dynamicHead={dynamicHead}
                getDynamicHead={getDynamicHead}
                getDynamicData={getDynamicData}
                controlData={controlData} 
                renderData={renderData}
                renderHead={renderHead}
                getRenderData={getRenderData} 
                getRenderHead={getRenderHead}
                cellSize={cellSize}
                getCellSize={getCellSize}
            />

            <ConstrolSlider 
                changeFontSize = {changeFontSize}
                resizeCellMarker = {resizeCellMarker}
                lastPickedColor={lastPickedColor}
                getLastPickedColor = {getLastPickedColor}
                defaultStorageData={defaultStorageData}
                historyStorageData={historyStorageData}
                updateData={refreshDataFromComponent}
                fillInterval_usedCount = {fillInterval_usedCount}
                refreshInterval_usedCount = {refreshInterval_usedCount}
                table_ref = {table_ref}
                switchTemplate = {switchTemplate}
                backToInitialState = {backToInitialState}
                syncBodyStyleToHeader={syncBodyStyleToHeader}
                cellSize={cellSize}
                controlData={controlData} 
                getControlData={getControlData} 
                renderData={renderData}
                renderHead={renderHead}
            />
        </div>
    )
}
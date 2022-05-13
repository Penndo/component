import * as React from "react";
import {useRef, useState } from "react";

import {createIDB, getAllValue,getValue} from "../Public/IDB";
import { shearData,recalculate_CellSize } from "../Public/Tools";
import Table from "../Table";
import ConstrolSlider from "../ConstrolSlider";
import { originControlData, originCellSize, originHead, originData } from "../Public/originContant";

import styles from "./index.module.less";

const defaultStoreName = "defaultStore";
const defaultHistoryName = "historyStore";

export default function App(){

    const table_ref = useRef(null);
    const [information,setInformation] = useState({
        controlData:originControlData,
        renderData:originData,
        renderHead:originHead,
        cellSize:originCellSize,
        dynamicData:originData,
        dynamicHead:originHead
    })
    const {controlData,renderData,renderHead,cellSize,dynamicData,dynamicHead} = information
    // const [renderData, setRenderData] = useState(originData);
    // const [renderHead, setRenderHead] = useState(originHead);
    // const [dynamicHead, setDynamicHead] = useState(originHead);
    // const [dynamicData, setDynamicData] = useState(originData);
    // const [controlData, setControlData] = useState(originControlData);
    // const [cellSize, setCellSize] = useState(originCellSize);
    const [headerIndependentStyle, setHeaderIndependentStyle] = useState(false);
    const [lastPickedColor,setLastPickedColor] = useState(controlData.fill.basicColor);
    const [defaultStorageData, setDefaultStorageData] = React.useState([]);
    const [historyStorageData, setHistoryStorageData] = React.useState([{id:1,history:""}]);


    //从模板更新页面数据
    function refreshDataFromComponent(fillInterval_usedCount){
        createIDB().then((db)=>{
            getAllValue(db,defaultHistoryName).then((result)=>{
                if(!result.length) return false;
                const indexValue = result[0].history;
                
                getValue(db,defaultStoreName,"title",indexValue).then((result)=>{
                    const data = result.information;
                    //更新 controlData 就可以驱动页面重新计算，进而得到最新的 renderData, renderHead
                    setInformation({
                        controlData:data.controlData,
                        renderData:data.renderData,
                        renderHead:data.renderHead,
                        cellSize:data.cellSize,
                        dynamicData:data.renderData,
                        dynamicHead:data.renderHead
                    })
                    // setControlData(data.controlData);
                    // setRenderData(data.renderData);
                    // setRenderHead(data.renderHead);
                    // setCellSize(data.cellSize);
                    // setDynamicHead(data.renderHead);
                    // setDynamicData(data.renderData);
                    
                    const {basicColor,intervalColor,switchState} = data.controlData.fill

                    if(fillInterval_usedCount === 1 && switchState === true){
                        setLastPickedColor(intervalColor === "" ? basicColor : intervalColor)
                    }else if(fillInterval_usedCount === 1 && switchState === false){
                        setLastPickedColor(basicColor)
                    }
                });
            });
        })
    }

    function getCellSize(data) {
        setInformation({...information,cellSize:data})
    }

    function syncBodyStyleToHeader() {
        setHeaderIndependentStyle(true)
    }

    function getDynamicData(data) {
        setInformation({...information,dynamicData:data})
        // setDynamicData(data)
    }

    function getDynamicHead(data) {
        setInformation({...information,dynamicHead:data})
        // setDynamicHead(data)
    }

    function getRenderData(data){
        setInformation({...information,renderData:data})
        // setRenderData(data)
    }

    function getRenderHead(data) {
        setInformation({...information,renderHead:data})
        // setRenderHead(data)
    }

    function getLastPickedColor(value) {
        setLastPickedColor(value)
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

        let lastHeaderIndependentStyle = headerIndependentStyle;

        if(headerIndependentStyle_condition){
            lastHeaderIndependentStyle = true;
        }

        //同步表格样式数据至表头
        function syncControlData() {
            let syncData = {}
            if(!lastHeaderIndependentStyle){       
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
        setInformation({
            ...information,
            controlData:{
                ...controlData,...syncControlData()
            }
        })
        console.log(data)
        // setControlData({
        //     ...controlData,...syncControlData()
        // })
    }

    function updateData(){
        console.log("updataData")
        createIDB().then((db)=>{
            //获取模板数据
            getAllValue(db,defaultStoreName).then((result)=>{
                setDefaultStorageData(result)
            });
            //获取最近一次的选择数据
            getAllValue(db,defaultHistoryName).then((result)=>{
                setHistoryStorageData(result)
            });
        })
    }

    //隔行换色的开启次数，作为其key，每重新开启一次，重新创建一个新的组件
    const [fillInterval_usedCount, setFillInterval_usedCount] = React.useState(1);
    function refreshInterval_usedCount(value){
        setFillInterval_usedCount(value)
    }

    const [colID, setColID] = useState(maxID(dynamicHead,"colID"))
    const [rowID, setRowID] = useState(maxID(dynamicData,"rowID"))

    function maxID(data,name){
        let IDArr = [];
        for(let i=0;i<data.length;i++){
            IDArr.push(data[i][name])
        };
        return Math.max(...IDArr)
    }

    function getColID(colID) {
        setColID(colID)
    }

    function getRowID(rowID) {
        setRowID(rowID)
    }

    function changeTableAmout_cols(count) {
        changeColsCount(count,dynamicHead,dynamicData)
    }

    function changeTableAmout_rows(count) {
        changeRowsCount(count,dynamicHead,dynamicData)
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
            // 根据列数来循环，以此确定将要往 row 这个空对象中添加多少个 key:value
            for(let j=0;j<readyRenderHead.length;j++){
                //先将标题中的值定义为 “”，再用原有的数据去覆盖。
                row[readyRenderHead[j]["colID"]] = "";
            }
            //用原有数据去覆盖生成的新数据。
            Object.assign(row, readyRenderData[i]);
            //将对象放入 mergedData 中
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

        let newCellSize = recalculate_CellSize(count,controlData,cellSize);
        getCellSize({...cellSize,...newCellSize});
        console.log(dynamicData)
        setInformation({
            renderHead:mergedHead,
            renderData:mergedData.slice(0,controlData.tableAmount.rows),
            dynamicData:count >= renderHead.length ? mergedData :information.dynamicData,
            dynamicHead:count >= renderHead.length ? mergedHead :information.dynamicHead,
            controlData:{...controlData,tableAmount:{...controlData.tableAmount,cols:count}},
            cellSize:{...cellSize,...newCellSize}
        })
    }

    function changeRowsCount(count,renderHead,renderData){
        let readyRenderHead = renderHead.slice();
        let readyRenderData = shearData(count,renderData,rowID,"rowID",getRowID);

        let mergedData = [];
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
        };

        console.log(mergedData)
        setInformation({
            ...information,
            dynamicData:count >= renderData.length ? mergedData : information.dynamicData,
            renderData:mergedData,
            controlData:{...controlData,tableAmount:{...controlData.tableAmount,rows:count}}
        })
    }

    //页面加载时，加载一次本地存储的数据
    React.useEffect(()=>{
        console.log("agjal")
        updateData();
        refreshDataFromComponent(fillInterval_usedCount);
    },[fillInterval_usedCount])

    //切换模板更新初始数据
    function switchTemplate(){
        setFillInterval_usedCount(1)
        refreshDataFromComponent(fillInterval_usedCount)
    }

    function backToInitialState(){
        setInformation(
            {
                controlData:originControlData,
                renderData:originData,
                renderHead:originHead,
                cellSize:originCellSize,
                dynamicData:originData,
                dynamicHead:originHead
            }
        )
        // setCellSize(originCellSize);
        // setControlData(originControlData);
        // setRenderHead(originHead);
        // setRenderData(originData);
    }

    return (
        <div className={styles["container"]}>
            <Table 
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
                getControlData={getControlData} 
                renderData={renderData}
                renderHead={renderHead}
                getRenderData={getRenderData} 
                getRenderHead={getRenderHead}
                cellSize={cellSize}
                getCellSize={getCellSize}
            />

            <ConstrolSlider 
                lastPickedColor={lastPickedColor}
                getLastPickedColor = {getLastPickedColor}
                defaultStorageData={defaultStorageData}
                historyStorageData={historyStorageData}
                updateData={updateData}
                fillInterval_usedCount = {fillInterval_usedCount}
                refreshInterval_usedCount = {refreshInterval_usedCount}
                table_ref = {table_ref}
                changeTableAmout_rows = {changeTableAmout_rows}
                changeTableAmout_cols = {changeTableAmout_cols}
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
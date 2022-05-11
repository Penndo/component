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

//从模板更新页面数据
function refreshDataFromComponent(setInformation,setDynamicHead,setDynamicData) {
    createIDB().then((db)=>{
        getAllValue(db,defaultHistoryName).then((result)=>{
            if(!result.length) return false;
            const indexValue = result[0].history;
            
            getValue(db,defaultStoreName,"title",indexValue).then((result)=>{
                const data = result.information;
                //更新 controlData 就可以驱动页面重新计算，进而得到最新的 renderData, renderHead
                setInformation(data);
                setDynamicHead(data.renderHead);
                setDynamicData(data.renderData);
            });
        });
    })
}

export default function App(){

    const [information,setInformation] = useState({
        renderHead:originHead,
        renderData:originData,
        controlData:originControlData,
        cellSize:originCellSize
    })
    const [dynamicHead, setDynamicHead] = useState(originHead);
    const [dynamicData, setDynamicData] = useState(originData);
    const [headerIndependentStyle, setHeaderIndependentStyle] = useState(false);

    const {renderData,renderHead,controlData,cellSize} = information
    const table_ref = useRef(null);

    function getRenderData(data){
        setInformation({...information,"renderData":data})
    }

    function getRenderHead(data) {
        setInformation({...information,"renderHead":data})
    }

    function getCellSize(data) {
        setInformation({...information,"cellSize":data})
    }

    function syncBodyStyleToHeader() {
        setHeaderIndependentStyle(true)
    }

    function getDynamicHead(data) {
        setDynamicHead(data)
    }

    function getDynamicData(data) {
        setDynamicData(data)
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

        setInformation({...information,"controlData":
            {
            ...controlData,...syncControlData()
            }
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
            for(let j=0;j<readyRenderHead.length;j++){
                row[readyRenderHead[j]["colID"]] = "";
            }
            Object.assign(row, readyRenderData[i]);
            mergedData.push(row);
        };

        if(count >= renderHead.length){
            setDynamicHead(mergedHead);
            setDynamicData(mergedData)
        }

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

        console.log(mergedData)

        let newCellSize = recalculate_CellSize(count,controlData,cellSize);

        setInformation({
            "renderHead":mergedHead,
            "renderData":mergedData,
            "controlData":{...controlData,tableAmount:{...controlData.tableAmount,cols:count}},
            "cellSize":{...cellSize,...newCellSize}
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
        if(count >= renderData.length){
            setDynamicData(mergedData)
        }
        setInformation({
            ...information,
            "renderData":mergedData,
            "controlData":{...controlData,tableAmount:{...controlData.tableAmount,rows:count}}

        })
    }

    //页面加载时，加载一次本地存储的数据
    React.useEffect(()=>{
        refreshDataFromComponent(setInformation,setDynamicHead,setDynamicData);
    },[])

    //切换模板更新初始数据
    function switchTemplate(){
        setFillInterval_usedCount(1)
        refreshDataFromComponent(setInformation,setDynamicHead,setDynamicData)
    }

    function backToInitialState(){
        setInformation(
            {
                renderHead:originHead,
                renderData:originData,
                controlData:originControlData,
                cellSize:originCellSize
            }
        )
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
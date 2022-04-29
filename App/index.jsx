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
function refreshDataFromComponent(setControlData,setCellSize,setDynamicHead,setDynamicData) {
    createIDB().then((db)=>{
        getAllValue(db,defaultHistoryName).then((result)=>{
            if(!result.length) return false;
            const indexValue = result[0].history;
            
            getValue(db,defaultStoreName,"title",indexValue).then((result)=>{
                const data = result.information;
                //更新 controlData 就可以驱动页面重新计算，进而得到最新的 renderData, renderHead
                setControlData(data.controlData);
                setDynamicData(data.renderData);
                // setRenderData(data.renderData);
                setDynamicHead(data.renderHead);
                // setRenderHead(data.renderHead);
                setCellSize(data.cellSize)
            });
        });
    })
}

export default function App(){

    const table_ref = useRef(null)

    //初始数据
    const [dynamicHead, setDynamicHead] = useState(originHead);
    const [dynamicData, setDynamicData] = useState(originData);
    const [controlData, setControlData] = useState(originControlData);

    //表头是否独立样式
    const [headerIndependentStyle, setHeaderIndependentStyle] = useState(false);
    function syncBodyStyleToHeader() {
        setHeaderIndependentStyle(true)
    }
    
    //单元格尺寸
    const [cellSize, setCellSize] = useState(originCellSize);
    const getCellSize = React.useCallback(
        (data)=>{
            setCellSize(data);
        },[]
    )

    //传递设置动态数据的函数给 Table。
    const set_dynamic_data = React.useCallback((data)=>{
        setDynamicData(data)
    },[])
    const set_dynamic_head = React.useCallback((data)=>{
        setDynamicHead(data)
    },[])

    //更新样式表
    const getControlData = React.useCallback(
        (data,name)=>{
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
                    if(name === "tbodyPadding"){
                        const {b_top,b_bottom} = data.tbodyPadding
                        syncData = {
                            theadPadding:{
                                h_top:b_top,
                                h_bottom:b_bottom
                                }
                        }
                    }else if(name === "fill"){
                        syncData = {
                            theadFill:{
                                basicColor:data.fill.basicColor
                            }
                        }
                    }else if(name === "textStyle"){
                        const {basicColor,fontSize,fontWeight} = data.textStyle;
                        syncData = {
                            theadTextStyle:{
                                basicColor:basicColor,
                                fontSize:fontSize,
                                fontWeight:fontWeight
                            }
                        }
                    };
                }
                return {...syncData,...data}
            }
           
            setControlData({
                ...controlData,...syncControlData()
            })

        },[controlData,headerIndependentStyle]
    )

    //隔行换色的开启次数，作为其key，没重新开启一次，重新创建一个新的组件
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

    const getColID = React.useCallback((colID)=>{
        setColID(colID)
    },[])

    const getRowID = React.useCallback((rowID)=>{
        setRowID(rowID)
    },[])

    //表格数量更新，更新动态数据 dynamicData,以及各列的宽度
    function changeCols(count) {
        //更新表格数据
        let shearedHead = shearData(count,dynamicHead,colID,"colID",getColID)
        if(shearedHead.length > dynamicHead.length){ //当更新后的数据长度大于原有的数据长度时，将这个更长的数据设置为 dynamicData,否则不做处理。因为只是对原有的 dynamicData 进行裁切，不会生成新的单元格。对最终数据呈现 renderData 没有影响
            setDynamicHead(shearedHead)
        }

        //更新列宽度
        const tableWidth = controlData.tableWidth;
        const width = 160;
        const cellArr = cellSize.width;
        const oldCellAmount = cellArr.length; //获取原有的数组长度
        const changeAmount = count - oldCellAmount; //获取长度改变量，>0 是增加列，<0 是减少列。

        let newCellArr=[];//先定义一个新数组。

        //如果是增加列
        if(changeAmount > 0){
            const increasedCellArr = new Array(changeAmount).fill(width);//要添加的数组
            newCellArr = cellArr.concat(increasedCellArr);//添加了新增数组后的新数组。
        }else{ //如果是减少列
            newCellArr = cellArr.slice(0,count);//重新拷贝一份cols长度的数组
        }
        
        //recalculate_CellSize 函数会重新处理表格宽度
        let newCellSize = recalculate_CellSize(newCellArr,tableWidth)
        getCellSize({...cellSize,...newCellSize});
    }

    function changeRows(count) {
        let shearedData = shearData(count,dynamicData,rowID,"rowID",getRowID)
        if(shearedData.length > dynamicData.length){
            setDynamicData(shearedData)
        }
    }
    
    const [renderData, setRenderData] = useState([]);
    const [renderHead, setRenderHead] = useState([]);

    //页面加载时，加载一次本地存储的数据
    React.useEffect(()=>{
        refreshDataFromComponent(setControlData,setCellSize,setDynamicHead,setDynamicData);
    },[])

    const getRenderData = React.useCallback(
        (data) => {
            setRenderData(data);
        },[]
    )

    const getRenderHead = React.useCallback(
        (data) => {
            setRenderHead(data)
        },[]
    )

    //切换模板更新初始数据
    function switchTemplate(){
        setFillInterval_usedCount(1)
        refreshDataFromComponent(setControlData,setCellSize,setDynamicHead,setDynamicData)
    }

    function backToInitialState(){
        setCellSize(originCellSize);
        setControlData(originControlData);
        // setRenderHead(originHead);
        // setRenderData(originData);
        setDynamicHead(originHead);
        setDynamicData(originData);
    }

    return (
        <div className={styles["container"]}>
            <Table 
                table_ref = {table_ref}
                colID={colID}
                rowID={rowID}
                getColID={getColID}
                getRowID={getRowID}
                dynamicData={dynamicData}
                dynamicHead={dynamicHead}
                setDynamicHead={set_dynamic_head}
                setDynamicData={set_dynamic_data}
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
                changeCols={changeCols}
                changeRows={changeRows}
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
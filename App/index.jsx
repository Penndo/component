import * as React from "react";
import { useState } from "react";
import {v4 as uuidv4} from "uuid";

import {createIDB, getAllValue,getValue} from "../Public/IDB";
import { shearData } from "../Public/Tools";

import Table from "../Table";
import ConstrolSlider from "../ConstrolSlider";

import styles from "./index.module.less";

const defaultStoreName = "defaultStore";
const defaultHistoryName = "historyStore";

const originControlData = {
    tableWidth:"640",
    tableAmount:{
        cols:"4",
        rows:"5"
    },
    dataFrom:{
        api:"https://randomuser.me/api/?results=5&inc=",
        parameter:"gender,email,nat,phone"
    },
    tbodyPadding:{
        b_top:"8",
        b_right:"8",
        b_bottom:"8",
        b_left:"8"
    },
    theadPadding:{
        h_top:"8",
        h_bottom:"8"
    },
    fill:{
        basicColor:"#FFFFFF",
        interLeaveChecked:false,
        intervalColor:""
    },
    border:{
        basicColor:"#D8D8D8",
        interLeaveChecked:false,
        intervalColor:""
    },
    theadFill:{
        basicColor:"#FFFFFF"
    },
    textStyle:{
        basicColor:"#333333",
        fontSize:"14",
        fontWeight:"regular"
    },
    theadTextStyle:{
        basicColor:"#333333",
        fontSize:"14",
        fontWeight:"regular"
    }
}

const originCellSize = {
    height:[34,34,34,34,34],
    width:[160,160,160,160]
}

//初始表头数据及格式
const originHead = [
    {title:"gender",key:uuidv4()},
    {title:"email",key:uuidv4()},
    {title:"nat",key:uuidv4()},
    {title:"phone",key:uuidv4()}
]

//初始表格数据及格式
const originData = [
    {"gender":"表","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com",key:uuidv4()},
    {"gender":"格","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com",key:uuidv4()},
    {"gender":"工","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com",key:uuidv4()},
    {"gender":"具","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com",key:uuidv4()},
    {"gender":"具","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com",key:uuidv4()}
]

//从模板更新页面数据
function refreshDataFromComponent(setControlData,setRenderData,setRenderHead,setCellSize) {
    createIDB().then((db)=>{
        getAllValue(db,defaultHistoryName).then((result)=>{
            if(!result.length) return false;
            const indexValue = result[0].history;
            getValue(db,defaultStoreName,"title",indexValue).then((result)=>{
                const data = result.information;
                //更新 controlData 就可以驱动页面重新计算，进而得到最新的 renderData, renderHead
                setControlData(data.controlData);
                setRenderData(data.renderData);
                setRenderHead(data.renderHead);
                setCellSize(data.cellSize)
            });
        });
    })
}

export default function App(){

    //初始数据
    const [dynamicHead, setDynamicHead] = useState(originHead);
    const [dynamicData, setDynamicData] = useState(originData);
    const [controlData, setControlData] = useState(originControlData);
    //单元格尺寸
    const [cellSize, setCellSize] = useState(originCellSize);

    const [headerIndependentStyle, setHeaderIndependentStyle] = useState(false);
    
    //拖动时以更新单元格尺寸
    const getCellSize = React.useCallback(
        (data)=>{
            setCellSize(data);
        },[]
    )

    //表格数量更新，更新动态数据 dynamicData
    function changeCols(count) {
        let shearedHead = shearData(count,dynamicHead)
        //当更新后的数据长度大于原有的数据长度时，将这个更长的数据设置为 dynamicData,否则不做处理。因为只是对原有的 dynamicData 进行裁切，不会生成新的单元格。对最终数据呈现 renderData 没有影响
        if(shearedHead.length > dynamicHead.length){
            setDynamicHead(shearedHead)
        }
    }
    function changeRows(count) {
        let shearedData = shearData(count,dynamicData)
        if(shearedData.length > dynamicData.length){
            setDynamicData(shearedData)
        }
    }

    //传递设置动态数据的函数给 Table。
    const set_dynamic_data = React.useCallback((data)=>{
        setDynamicData(data)
    },[])
    const set_dynamic_head = React.useCallback((data)=>{
        setDynamicHead(data)
    },[])

    //表头独立样式启用
    function syncBodyStyleToHeader() {
        setHeaderIndependentStyle(true)
    }

    //更新样式表
    const getControlData = React.useCallback(

        (name,data)=>{
                //同步表格样式数据至表头
                function syncControlData() {
                    let syncData = {}
                    if(!headerIndependentStyle){              
                        if(name === "tbodyPadding"){
                                syncData = {theadPadding:{
                                    h_top:data.b_top,
                                    h_bottom:data.b_bottom
                                }
                            }
                        }else if(name === "fill"){
                                syncData = {theadFill:{
                                    basicColor:data.basicColor
                                }
                            }
                        }else if(name === "textStyle"){
                                syncData = {theadTextStyle:{
                                    basicColor:data.basicColor,
                                    fontSize:data.fontSize,
                                    fontWeight:data.fontWeight
                                }
                            }
                        };
                    }
                    return {...syncData,[name]:data}
                }

                setControlData({
                    ...controlData,...syncControlData()
                })

        },[controlData,headerIndependentStyle]
    )

    
    const [renderData, setRenderData] = useState([]);
    const [renderHead, setRenderHead] = useState([]);

    //页面加载时，加载一次本地存储的数据
    React.useEffect(()=>{
        refreshDataFromComponent(setControlData,setRenderData,setRenderHead,setCellSize);
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
        refreshDataFromComponent(setControlData,setRenderData,setRenderHead,setCellSize)
    }


    function backToInitialState(){
        setCellSize(originCellSize);
        setControlData(originControlData);
        setRenderHead(originHead);
        setRenderData(originData);
    }

    return (
        <div className={styles["container"]}>
            <Table 
                dynamicData={dynamicData}
                dynamicHead={dynamicHead}
                setDynamicHead={set_dynamic_head}
                setDynamicData={set_dynamic_data}
                controlData={controlData} 
                getControlData={getControlData} 
                getRenderData={getRenderData} 
                getRenderHead={getRenderHead}
                cellSize={cellSize}
                getCellSize={getCellSize}
            />

            <ConstrolSlider 
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
import * as React from "react"
import Table from "../Table"
import ConstrolSlider from "../ConstrolSlider";
import * as IDB from "../Public/IDB";
import styles from "./index.module.less"
import { useState } from "react";

const defaultStoreName = "defaultStore";
const defaultHistoryName = "historyStore";

function loadStorageData(setRenderData,setRenderHead,setControlData) {
    IDB.createIDB().then((db)=>{
        IDB.getAllValue(db,defaultHistoryName).then((result)=>{
            if(!result.length) return false;
            const indexValue = result[0].history;
            IDB.getValue(db,defaultStoreName,"title",indexValue).then((result)=>{
                if(!result) return false;
                console.log(result.information)
                const data = result.information;
                setRenderData(data.renderData);
                setRenderHead(data.renderHead);
                setControlData(data.controlData);
            });
        })
    })
}

export default function App(){

    const [cellSize, setCellSize] = useState({});
    const [theadIsEnable, setTheadIsEnable] = useState(false);

    const [controlData, setControlData] = useState({
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
            intervalColor:""
        },
        border:{
            basicColor:"#D8D8D8",
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
    })

    const getCellSize = React.useCallback(
        (data)=>{
            setCellSize(data);
        },[]
    )

    //表头独立启用
    function theadEnable() {
        setTheadIsEnable(true)
    }

    const syncControlData = React.useCallback(
        (name, data)=>{

            let syncData = {}
            if(!theadIsEnable){              
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
                }
            }
            return {...syncData,[name]:data}
            
        },[theadIsEnable]
    )

    //更新样式表
    const getControlData = React.useCallback(
        (name,data)=>{

                setControlData({
                    ...controlData,...syncControlData(name,data)
                })

        },[controlData,syncControlData]
    )

    
    const [renderData, setRenderData] = useState([]);
    const [renderHead, setRenderHead] = useState([]);

    React.useEffect(()=>{
        loadStorageData(setRenderData,setRenderHead,setControlData);
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

    //点击切换模板。
    function switchTemplate(indexValue){
        IDB.createIDB().then((db)=>{
            IDB.getValue(db,defaultStoreName,"title",indexValue).then((result)=>{
                // console.log(result.information)
                const data = result.information;
                setRenderData(data.renderData);
                setRenderHead(data.renderHead);
                setControlData(data.controlData);
            });
        })
    }

    return (
        <div className={styles["container"]}>
            <Table 
                theadIsEnable={theadIsEnable}
                controlData={controlData} 
                getControlData={getControlData} 
                getRenderData={getRenderData} 
                getRenderHead={getRenderHead}
                cellSize={cellSize} 
                getCellSize={getCellSize}
            />

            <ConstrolSlider 
                switchTemplate = {switchTemplate}
                theadEnable={theadEnable}
                cellSize={cellSize}
                controlData={controlData} 
                getControlData={getControlData} 
                renderData={renderData}
                renderHead={renderHead}
            />
        </div>
    )
}
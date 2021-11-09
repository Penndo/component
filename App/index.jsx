import * as React from "react"
import Table from "../Table"
import ConstrolSlider from "../ConstrolSlider"
import styles from "./index.module.less"
import { useState } from "react"


export default function App(){

    const [cellSize, setCellSize] = useState({});

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
        padding:{
            top:"8",
            right:"8",
            bottom:"8",
            left:"8"
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
            fontWeight:"normal"
        },
        theadTextStyle:{
            basicColor:"#333333",
            fontSize:"14",
            fontWeight:"normal"
        }
    })
    const getCellSize = React.useCallback(
        (data)=>{
            setCellSize(data);
        },[]
    )

    //更新样式表
    const getControlData = React.useCallback(
        (name,data)=>{
            setControlData({
                ...controlData,[name]:data
            })
        },[controlData]
    )

    const [renderData, setRenderData] = useState([]);
    const [renderHead, setRenderHead] = useState([]);

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

    return (
        <div className={styles["container"]}>
            <Table 
                controlData={controlData} 
                getControlData={getControlData} 
                getRenderData={getRenderData} 
                getRenderHead={getRenderHead}
                cellSize={cellSize} 
                getCellSize={getCellSize}
            />

            <ConstrolSlider 
                cellSize={cellSize}
                controlData={controlData} 
                getControlData={getControlData} 
                renderData={renderData}
                renderHead={renderHead}
            />
        </div>
    )
}
import * as React from "react"
import TextStyleSetting from "./TextStyle"
import TableBg from "./TableBg"
import CellPaddingSetting from "./CellPadding"
import SwitchButton from "./SwitchButton"
import CellAmount from "./CellAmount"
import TableData from "./TableData"
import ButtonGroup from "./ButtonGroup"
import styles from "./index.module.less"
import TableWidth from "./TableWidth"
import TemplateSelecter from "./TemplateSelecter"
import * as IDB from "../Public/IDB"

const defaultStoreName = "defaultStore";;
const defaultHistoryName = "historyStore";


export default function ConstrolSlider(props){

    const [defaultStorageData, setDefaultStorageData] = React.useState([]);
    const [historyStorageData, setHistoryStorageData] = React.useState([{id:1,history:""}]);
    const [data,setData] = React.useState(props.controlData)


    function updateData(){
        IDB.createIDB().then((db)=>{
            console.log("更新渲染")
            //获取模板数据
            IDB.getAllValue(db,defaultStoreName).then((result)=>{
                setDefaultStorageData(result)
            });
            //获取最近一次的选择数据
            IDB.getAllValue(db,defaultHistoryName).then((result)=>{
                setHistoryStorageData(result)
            });
        })
    }



    //props 更新后，更新data
    React.useEffect(()=>{
        updateData();
        setData(props.controlData)
    },[props])

    const {tableWidth, tableAmount, dataFrom, tbodyPadding, theadPadding, theadFill, fill, border, textStyle, theadTextStyle} = data;
    const {getControlData,renderData,renderHead,controlData,cellSize,theadEnable,switchTemplate} = props;

    const [styleType, setStyleType] = React.useState("tbodyStyle");

    function witchCheck(name) {
        setStyleType(name);
        theadEnable(name === "theadStyle")
    }

    return (
        <div className={styles["constrolSlider"]}>

            <div className={styles["configureArea"]}>

                <TemplateSelecter defaultStorageData={defaultStorageData} historyStorageData={historyStorageData} switchTemplate={switchTemplate} updateData={updateData} type="选择模板"/>

                <TableWidth type="表格宽度" getControlData = {getControlData} data = {tableWidth}/>

                <CellAmount type="表格数量" getControlData = {getControlData} name="tableAmount" data={tableAmount} />

                <TableData type = "数据源" getControlData = {getControlData} name="dataFrom" data={dataFrom}/>

                <SwitchButton witchCheck = {witchCheck}  />

                <div className={styles["tbodyStyle"]} style={{display: styleType === "tbodyStyle" ? "block" : "none"}}>

                    <CellPaddingSetting type="padding" name="tbodyPadding" area="b" data={tbodyPadding} getControlData = {getControlData}/>

                    <TableBg type="填充" toggleLabel="隔行换色" switchColor = {true} switchColorPicker={true} name="fill" data={fill} defaultColor={fill.basicColor} getControlData = {getControlData} />

                    <TableBg type="边框" toggleLabel="列分割线" switchColor = {true} switchColorPicker={false} name="border" data={border} defaultColor={border.basicColor} getControlData = {getControlData} />

                    <TextStyleSetting type="文本样式" name="textStyle" data={textStyle} getControlData = {getControlData}/>
                
                </div>

                <div className={styles["theadStyle"]} style={{display: styleType === "theadStyle" ? "block" : "none"}}>
                    
                    <CellPaddingSetting type="padding" name="theadPadding" area="h" data={theadPadding} getControlData = {getControlData}/>
                
                    <TableBg type="填充" switchColor = {false} name="theadFill" data={theadFill} defaultColor={theadFill.basicColor} getControlData = {getControlData} />

                    <TextStyleSetting type="文本样式" name="theadTextStyle" data={theadTextStyle} getControlData = {getControlData}/>
                
                </div>

                

            </div>

            <div className={styles["buttonGroup"]}>
                    <ButtonGroup updateData={updateData} renderHead={renderHead} renderData={renderData} controlData={controlData} cellSize={cellSize}/>
            </div>

        </div>
    )
}
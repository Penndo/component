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
import { createIDB, getAllValue } from "../Public/IDB"

const defaultStoreName = "defaultStore";;
const defaultHistoryName = "historyStore";


export default function ConstrolSlider(props){

    //indexedDB 数据库初始化。defaultStorageData 用来保存模板数据。historyStorageData 用来存放最后一次的选择。
    const [defaultStorageData, setDefaultStorageData] = React.useState([]);
    const [historyStorageData, setHistoryStorageData] = React.useState([{id:1,history:""}]);
    const {getControlData,renderData,renderHead,controlData,cellSize,syncBodyStyleToHeader,switchTemplate,backToInitialState,changeCols,changeRows} = props;

    //props 中的 controlData 保存为一个状态，这样在 props 更新后，可以通过 useEffect 去更新状态，以驱动页面更新。
    const [styleData,setStyleData] = React.useState(controlData)

    //获取模板数据并更新到页面,主要用来控制模板下拉框的数据显示
    function updateData(){
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

    //props 更新后，更新data
    React.useEffect(()=>{
        updateData();
        setStyleData(controlData)
    },[controlData])

    //从 styleData 中获取更详细的样式数据
    const {tableWidth, tableAmount, dataFrom, tbodyPadding, theadPadding, theadFill, fill, border, textStyle, theadTextStyle} = styleData;
    
    //默认样式给到 tbodyStyle.通过下面 return 查看
    const [styleType, setStyleType] = React.useState("tbodyStyle");

    //控制【表格样式】【表头样式】哪一个显示
    function witchCheck(name) {
        setStyleType(name);
        //切换 switchButton 如果是 theadStyle 就执行 headStyle() 就是将 表格样式 通过给表头样式那个函数。
        syncBodyStyleToHeader(name === "theadStyle")
    }

    return (
        <div className={styles["constrolSlider"]}>

            <div className={styles["configureArea"]}>

                <TemplateSelecter defaultStorageData={defaultStorageData} historyStorageData={historyStorageData} switchTemplate={switchTemplate} backToInitialState={backToInitialState} updateData={updateData} type="选择模板"/>
                <TableWidth type="表格宽度" getControlData = {getControlData} data = {tableWidth}/>
                <CellAmount type="表格数量" getControlData = {getControlData} name="tableAmount" data={tableAmount} changeCols = {changeCols} changeRows={changeRows} />
                <TableData type = "数据源" getControlData = {getControlData} name="dataFrom" data={dataFrom}/>
                <SwitchButton witchCheck = {witchCheck}  />

                <div className={styles["tbodyStyle"]} style={{display: styleType === "tbodyStyle" ? "block" : "none"}}>
                    <CellPaddingSetting type="padding" name="tbodyPadding" area="b" data={tbodyPadding} getControlData = {getControlData}/>
                    <TableBg type="填充" toggleLabel="隔行换色" switchColor = {true} switchColorPicker={true} interLeaveChecked = {fill.interLeaveChecked} name="fill" data={fill} defaultColor={fill.basicColor} getControlData = {getControlData} />
                    <TableBg type="边框" toggleLabel="列分割线" switchColor = {true} switchColorPicker={false} interLeaveChecked = {border.interLeaveChecked} name="border" data={border} defaultColor={border.basicColor} getControlData = {getControlData} />
                    <TextStyleSetting type="文本样式" name="textStyle" data={textStyle} getControlData = {getControlData}/>
                </div>

                <div className={styles["theadStyle"]} style={{display: styleType === "theadStyle" ? "block" : "none"}}>
                    <CellPaddingSetting type="padding" name="theadPadding" area="h" data={theadPadding} getControlData = {getControlData}/>
                    <TableBg type="填充" switchColor = {false} interLeaveChecked = {false} name="theadFill" data={theadFill} defaultColor={theadFill.basicColor} getControlData = {getControlData} />
                    <TextStyleSetting type="文本样式" name="theadTextStyle" data={theadTextStyle} getControlData = {getControlData}/>
                </div>

            </div>

            <div className={styles["buttonGroup"]}>
                    <ButtonGroup updateData={updateData} renderHead={renderHead} renderData={renderData} controlData={controlData} cellSize={cellSize}/>
            </div>

        </div>
    )
}
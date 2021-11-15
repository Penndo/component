import * as React from "react"
import TextStyleSetting from "./TextStyle"
import TableBg from "./TableBg"
import CellPaddingSetting from "./CellPadding"
import FormInputV from "./FormInputV"
import SwitchButton from "./SwitchButton"
import CellAmount from "./CellAmount"
import TableData from "./TableData"
import ButtonGroup from "./ButtonGroup"
// import TableStyle from "./TableStyle"
import styles from "./index.module.less"


export default function ConstrolSlider(props){

    const {tableWidth, tableAmount, dataFrom, padding, fill, border, textStyle, theadTextStyle} = props.controlData;
    const {getControlData,renderData,renderHead,controlData,cellSize} = props;

    const [state, setState] = React.useState("tbodyStyle")

    function witchCheck(name) {
        setState(name)
    }

    return (
        <div className={styles["constrolSlider"]}>

            <div className={styles["configureArea"]}>

                <FormInputV type="表格宽度" getControlData = {getControlData} data = {tableWidth}/>

                <CellAmount type="表格数量" getControlData = {getControlData} name="tableAmount" data={tableAmount} />

                <TableData type = "数据源" getControlData = {getControlData} name="dataFrom" data={dataFrom}/>
                
                <CellPaddingSetting type="padding" name="padding" data={padding} getControlData = {getControlData}/>

                <SwitchButton witchCheck = {witchCheck} />

                <div className={styles["tbodyStyle"]} style={{display: state === "tbodyStyle" ? "block" : "none"}}>

                    <TableBg type="填充" toggleLabel="隔行换色" switchColor = {true} switchColorPicker={true} defaultColor="#FFFFFF" getControlData = {getControlData} name="fill" data={fill}/>

                    <TableBg type="边框" toggleLabel="列分割线" switchColor = {true} switchColorPicker={false} defaultColor="#D8D8D8" getControlData = {getControlData} name="border" data={border}/>

                    <TextStyleSetting type="文本样式" name="textStyle" data={textStyle} getControlData = {getControlData}/>
                
                </div>

                <div className={styles["theadStyle"]} style={{display: state === "theadStyle" ? "block" : "none"}}>
                
                    <TableBg type="填充" switchColor = {false} defaultColor="#FFFFFF" getControlData = {getControlData} name="theadFill" data={fill}/>

                    <TextStyleSetting type="文本样式" name="theadTextStyle" data={theadTextStyle} getControlData = {getControlData}/>
                
                </div>

                

            </div>

            <div className={styles["buttonGroup"]}>
                    <ButtonGroup renderHead={renderHead} renderData={renderData} controlData={controlData} cellSize={cellSize}/>
            </div>

        </div>
    )
}
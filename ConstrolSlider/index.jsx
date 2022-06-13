import * as React from "react"
import TextStyleSetting from "./TextStyle"
import TableBg from "./TableBg"
import CellPaddingSetting from "./CellPadding"
import SwitchButton from "./SwitchButton"
import CellAmount from "./CellAmount"
import ButtonGroup from "./ButtonGroup"
import styles from "./index.module.less"
import TableWidth from "./TableWidth"
import TemplateSelecter from "./TemplateSelecter"

export default function ConstrolSlider(props){
    const {getControlData,renderData,renderHead,controlData,cellSize,syncBodyStyleToHeader,switchTemplate,backToInitialState,table_ref,fillInterval_usedCount,refreshInterval_usedCount,defaultStorageData,historyStorageData,updateData,lastPickedColor,getLastPickedColor,resizeCellMarker} = props;
    const {tableWidth, tableAmount, tbodyPadding, theadPadding, theadFill, fill, border, textStyle, theadTextStyle} = controlData;

    function getValue(typeName,propertyName,value){

        if(value !== "" && typeName === "fill"){
            getLastPickedColor(value)
        }
        let newData = {}
        if(typeName === propertyName){
            newData = {[typeName]:value}
        }else{
            if(typeName === "border" && border.switchState){
                newData ={
                    [typeName]:{...controlData[typeName],basicColor:value,intervalColor:value}
                }
            }else{
                newData = {
                    [typeName]:{...controlData[typeName],[propertyName]:value}
                };
            }
        }
        getControlData(typeName,newData)
    }

    function changeSwitchState(typeName,state){
        //设置
        if(typeName === "fill"){
            refreshInterval_usedCount(fillInterval_usedCount + 1);
            if(state === true){
                getControlData(null,{
                        fill:{
                            ...controlData["fill"],
                            switchState:true,
                            intervalColor:lastPickedColor
                        },
                        border:{
                            ...controlData["border"],
                            switchState:false,
                            intervalColor:""
                        }
                });
            }else{
                getControlData(null,{
                    fill:{
                        ...controlData["fill"],
                        switchState:false,
                        intervalColor:""
                    }
                })
            }
        }else if(typeName === "border"){
            if(state === true){
                getControlData(null,{
                    fill:{
                        ...controlData["fill"],
                        switchState:false,
                        intervalColor:""
                    },
                    border:{
                        ...controlData["border"],
                        switchState:true,
                        intervalColor:border.basicColor
                    }
                });

            }else{
                getControlData(null,{
                    border:{
                        ...controlData["border"],
                        switchState:false,
                        intervalColor:""
                    }
                });
            }
        }
    }
        
    //默认样式给到 tbodyStyle.通过下面 return 查看
    const [styleType, setStyleType] = React.useState("tbodyStyle");

    //控制【表格样式】【表头样式】哪一个显示
    function witchCheck(typeName) {
        setStyleType(typeName);
        //切换 switchButton 如果是 theadStyle 就执行 headStyle() 就是将 表格样式 通过给表头样式那个函数。
        syncBodyStyleToHeader(typeName === "theadStyle")
    }

    return (
        <div className={styles["constrolSlider"]}>
            <div className={styles["configureArea"]}>
                <TemplateSelecter type="选择模板" defaultStorageData={defaultStorageData} historyStorageData={historyStorageData} switchTemplate={switchTemplate} backToInitialState={backToInitialState} updateData={updateData} refreshInterval_usedCount = {refreshInterval_usedCount}/>
                <TableWidth type="表格宽度" typeName = "tableWidth" getValue = {getValue}  data = {tableWidth} resizeCellMarker = {resizeCellMarker}/>
                <CellAmount type="表格数量" typeName = "tableAmount" data={tableAmount} resizeCellMarker = {resizeCellMarker}/>
                {/* <TableData type = "数据源" getControlData = {getControlData} typeName="dataFrom" data={dataFrom}/> */}
                <SwitchButton witchCheck = {witchCheck}  />

                <div className={styles["tbodyStyle"]} style={{display: styleType === "tbodyStyle" ? "block" : "none"}}>
                    <CellPaddingSetting type="padding" typeName="tbodyPadding" area="b" data={tbodyPadding} getValue = {getValue} resizeCellMarker = {resizeCellMarker}/>
                    <TableBg type="填充" fillInterval_usedCount={fillInterval_usedCount} toggleLabel="隔行换色" switchColor = {true} switchColorPicker={true} typeName="fill" data={fill} switchState={fill.switchState} changeSwitchState={changeSwitchState}  getValue={getValue}/>
                    <TableBg type="边框" fillInterval_usedCount={fillInterval_usedCount} toggleLabel="列分割线" switchColor = {true} switchColorPicker={false} typeName="border" data={border} switchState={border.switchState} changeSwitchState={changeSwitchState}  getValue={getValue} />
                    <TextStyleSetting type="文本样式" typeName="textStyle" data={textStyle} getValue = {getValue}/>
                </div>

                <div className={styles["theadStyle"]} style={{display: styleType === "theadStyle" ? "block" : "none"}}>
                    <CellPaddingSetting type="padding" typeName="theadPadding" area="h" data={theadPadding} getValue = {getValue} resizeCellMarker = {resizeCellMarker}/>
                    <TableBg type="填充" switchColor = {false} typeName="theadFill" data={theadFill} getValue={getValue}/>
                    <TextStyleSetting type="文本样式" typeName="theadTextStyle" data={theadTextStyle} getValue = {getValue}/>
                </div>

            </div>

            <div className={styles["buttonGroup"]}>
                    <ButtonGroup table_ref={table_ref} updateData={updateData} renderHead={renderHead} renderData={renderData} controlData={controlData} cellSize={cellSize}/>
            </div>

        </div>
    )
}
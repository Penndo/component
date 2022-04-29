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
import { createIDB, getAllValue } from "../Public/IDB"

const defaultStoreName = "defaultStore";;
const defaultHistoryName = "historyStore";


export default function ConstrolSlider(props){
    const {getControlData,renderData,renderHead,controlData,cellSize,syncBodyStyleToHeader,switchTemplate,backToInitialState,changeCols,changeRows,table_ref,fillInterval_usedCount,refreshInterval_usedCount} = props;
    const {tableWidth, tableAmount, tbodyPadding, theadPadding, theadFill, fill, border, textStyle, theadTextStyle} = controlData;

    const [lastPickedColor,setLastPickedColor] = React.useState({
        fill:fill.basicColor,
        border:border.basicColor,
    })

    function getValue(typeName,propertyName,value){

        if(value !== "" && typeName === "fill"){
            setLastPickedColor({...lastPickedColor,[typeName]:value})
        }
        console.log(typeName,propertyName,value)
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

        getControlData(newData,typeName)
    }

    function changeSwitchState(typeName,state){
        //设置
        if(typeName === "fill"){
            refreshInterval_usedCount(fillInterval_usedCount + 1);
            if(state === true){
                getControlData({
                        fill:{
                            ...controlData["fill"],
                            switchState:true,
                            intervalColor:lastPickedColor["fill"]
                        },
                        border:{
                            ...controlData["border"],
                            switchState:false,
                            intervalColor:""
                        }
                });
            }else{
                console.log("关闭 fill")
                getControlData({
                    fill:{
                        ...controlData["fill"],
                        switchState:false,
                        intervalColor:""
                    }
                })
            }
        }else if(typeName === "border"){
            if(state === true){
                getControlData({
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
                getControlData({
                    border:{
                        ...controlData["border"],
                        switchState:false,
                        intervalColor:""
                    }
                });
            }
        }
    }
    
    //indexedDB 数据库初始化。defaultStorageData 用来保存模板数据。historyStorageData 用来存放最后一次的选择。
    const [defaultStorageData, setDefaultStorageData] = React.useState([]);
    const [historyStorageData, setHistoryStorageData] = React.useState([{id:1,history:""}]);
    
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

    // props 更新后，更新data
    React.useEffect(()=>{
        updateData();
        if(fillInterval_usedCount === 1 && fill.switchState === true){
            setLastPickedColor({fill:fill.intervalColor === "" ? fill.basicColor : fill.intervalColor,border:fill.basicColor})
        }else if(fillInterval_usedCount === 1 && fill.switchState === false){
            setLastPickedColor({fill:fill.basicColor,border:fill.basicColor})
        }
    },[fillInterval_usedCount,fill.basicColor,fill.intervalColor,fill.switchState])
    
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
                <TableWidth type="表格宽度" typeName = "tableWidth" getValue = {getValue}  data = {tableWidth}/>
                <CellAmount type="表格数量" typeName = "tableAmount" getValue = {getValue} data={tableAmount} changeCols = {changeCols} changeRows={changeRows} />
                {/* <TableData type = "数据源" getControlData = {getControlData} typeName="dataFrom" data={dataFrom}/> */}
                <SwitchButton witchCheck = {witchCheck}  />

                <div className={styles["tbodyStyle"]} style={{display: styleType === "tbodyStyle" ? "block" : "none"}}>
                    <CellPaddingSetting type="padding" typeName="tbodyPadding" area="b" data={tbodyPadding} getValue = {getValue} />
                    <TableBg type="填充" fillInterval_usedCount={fillInterval_usedCount} toggleLabel="隔行换色" switchColor = {true} switchColorPicker={true} typeName="fill" data={fill} switchState={fill.switchState} lastPickedColor = {lastPickedColor.fill} changeSwitchState={changeSwitchState}  getValue={getValue}/>
                    <TableBg type="边框" fillInterval_usedCount={fillInterval_usedCount} toggleLabel="列分割线" switchColor = {true} switchColorPicker={false} typeName="border" data={border} switchState={border.switchState} lastPickedColor = {lastPickedColor.border} changeSwitchState={changeSwitchState}  getValue={getValue} />
                    <TextStyleSetting type="文本样式" typeName="textStyle" data={textStyle} getValue = {getValue}/>
                </div>

                <div className={styles["theadStyle"]} style={{display: styleType === "theadStyle" ? "block" : "none"}}>
                    <CellPaddingSetting type="padding" typeName="theadPadding" area="h" data={theadPadding} getValue = {getValue}/>
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
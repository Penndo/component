import * as React from "react";
import ColorPicker from "../../Public/ColorPicker";
import ColorSwitch from "../../Public/ColorSwitch";
import styles from "./index.module.less";


class TableBg extends React.Component {

    state = {
        data:this.props.data,
        //switch默认为关闭状态
        switchState:false,
        //historyColor 用来存放当前组件中 colorpicker 的最后一次取值。
        historyColor:this.props.data.intervalColor !== "" && this.props.data.intervalColor !== undefined ? this.props.data.intervalColor : this.props.defaultColor
    }

    componentDidUpdate(prevProps){
        if(this.props.data !== prevProps.data){
            this.setState({data:this.props.data})
        }
        if(this.props.data.intervalColor !== "" && this.props.data.intervalColor !== undefined){
            if(this.props.data.intervalColor !== prevProps.data.intervalColor){
                this.setState({historyColor:this.props.data.intervalColor})
            }
        }

    }

    //从 ColorSwitch 中获取 switch 的状态值，用来控制 newData 的数据类型。
    getSwitchState = (switchState) => {
        this.setState({
            switchState:switchState
        })
    }
    
    //获取颜色值，并更新 data 数据
    getValue = (name,value,object) => {

        //获取状态中的 data, switchState, historyColor 数据
        const {data,switchState,historyColor} = this.state;

        const {switchColorPicker} = this.props

        //当隔行换色按钮关闭时，传给 data 的颜色值为 “”，不更新 historyColor。以便在下次开启隔行换色时有值可以使用。
        if(value !== ""){
            this.setState({
                historyColor: value
            })
        }

        //设置新的 data
        let newData = {}

        //如果该组件运用于边框，边框颜色没有设置选择器。this.props.switchColorPicker 为 false 。在这种条件下开启边框色，允许修改填充色的同时修改边框色。
        //修改 fill 一并修改 intervalColor 的值。如果未开启，那么传给 intervalColor 的值为 “”。
        if(!switchColorPicker && switchState){
            newData = {...data,"basicColor": value !== "" ? value : historyColor ,"intervalColor":value,...object}
        }else{
            newData = {...data,[name]: value,...object};
        }

        //更新数据
        this.setState({
            data: newData,
        })

        this.props.getControlData(this.props.name, newData)
    }

    render(){
        const {defaultColor, toggleLabel, switchColor, interLeaveChecked, switchColorPicker, getControlData, type, data} = this.props;
        const {historyColor, switchState} = this.state;
        
        return(
            <div>
                <p>{type}</p>
                <div className={styles["stork"]}>
                    
                    {/*填充色 边框色*/}
                    <div>
                        <ColorPicker style={{ width: 62, height: 24}} defaultColor={defaultColor} name = "basicColor" getValue={this.getValue}/>
                        <label>颜色</label>
                    </div>

                    {/*隔行换色 分割线颜色*/}
                    {
                        switchColor ? 
                        <ColorSwitch 
                            name = "intervalColor" 
                            defaultColor={defaultColor}
                            historyColor={switchState ? data.intervalColor : historyColor} 
                            toggleLabel={toggleLabel} 
                            interLeaveChecked = {interLeaveChecked}
                            switchColorPicker={switchColorPicker} 
                            getControlData={getControlData}
                            getValue={this.getValue} 
                            getSwitchState={this.getSwitchState} 
                        />:
                        null
                    }
                    

                    

                </div>
            </div>
        )
    }
}

export default TableBg;


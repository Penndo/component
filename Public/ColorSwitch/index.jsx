import * as React from "react"
import ColorPicker from "../ColorPicker"
import ToggleSwitch from "../ToggleSwitch"
import styles from "./index.module.less"

class ColorSwitch extends React.Component {
    //通过 ToggleSwitch 控制颜色的传递
    state = {
        isDisplay:"none",
        intervalDefaultColor:this.props.historyColor,
        keyValue:1
    }

    handleSwitch = (switchState) => { 
        //开关打开时，将 historyColor 传到 intervalColor 中；开关关闭时，将 “空” 传到 intervalColor 中
        this.props.getValue("intervalColor", switchState ? this.props.historyColor : "");
        this.setState({
            isDisplay: switchState ? "block" : "none",
            intervalDefaultColor: this.props.historyColor,
        })  

        //用来控制 keyValue 的值，进而控制 colorPicker 是否更新，switch 每次打开时，keyValue + 1，生成一个新的colorPicker。
        //详情可看 react 官网文档 《你可能不需要使用派生 state》
        if(switchState){
            this.setState({
                keyValue:this.state.keyValue + 1,
            })
        }     
        //给父组件一个 switchState 状态的一个反馈
        this.props.getSwitchState(switchState)
    }
    
    render(){
        const {toggleLabel, switchColorPicker, getValue, name} = this.props;
        const {isDisplay, intervalDefaultColor} = this.state;

        return (
            <div className={styles["switchGroup"]}>
            
                <ToggleSwitch label={toggleLabel} handleSwitch = {this.handleSwitch}/>

                {/*包裹层的 div 用来控制 colorpicker 是否可用*/}
                <div style={{display: switchColorPicker ? isDisplay : "none"}}>
                    <ColorPicker key={this.state.keyValue} style={{ width: 24, height: 24, marginLeft: 8}} defaultColor={intervalDefaultColor} name={name} getValue={getValue} />
                </div>
            </div>
        )
    }
}

export default ColorSwitch;
import * as React from "react"
import styles from './index.module.less'
import TextInput from "../../Public/TextInput"

class CellPaddingSetting extends React.Component {

    state = {
        data:this.props.data
    }

    getValue = (name,value) => {

        //获取状态中的数据
        const {data} = this.state;

        //插入修改的数据
        const newData = {...data,[name]: value};

        //更新数据
        this.setState({
            data: newData
        })
        
        this.props.getControlData(this.props.name, newData)
    }

    render(){
        return (
            <div>
            <p>{this.props.type}</p>
                <div className={styles["cellPadding"]}>
                    <TextInput defaultValue = {8} name="top" label = "top" canInput={true} getValue={this.getValue}/>
                    <TextInput defaultValue = {8} name="right" label = "right" canInput={true} getValue={this.getValue}/>
                    <TextInput defaultValue = {8} name="bottom" label = "bottom" canInput={true} getValue={this.getValue}/>
                    <TextInput defaultValue = {8} name="left" label = "left" canInput={true} getValue={this.getValue}/>
                </div>
            </div>
        )
    }
}

export default CellPaddingSetting;
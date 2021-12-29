import * as React from "react"
import styles from './index.module.less'
import TextInput from "../../Public/TextInput"

class CellPaddingSetting extends React.Component {

    state = {
        data:this.props.data
    }

    componentDidUpdate(prevProps){
        if(this.props.data !== prevProps.data){
            this.setState({data:this.props.data})
        }
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
        const {area, data} = this.props;
        return (
            <div>
            <p>{this.props.type}</p>
                {this.props.name === "tbodyPadding" 
                ? 
                    <div className={styles["cellPadding"]+" "+styles["bodyPadding"]}>
                        <TextInput defaultValue = {data[area+"_top"]} name={area+"_top"} label = "top" canInput={true} getValue={this.getValue}/>
                        <TextInput defaultValue = {data[area+"_right"]} name={area+"_right"} label = "right" canInput={true} getValue={this.getValue}/> 
                        <TextInput defaultValue = {data[area+"_bottom"]} name={area+"_bottom"} label = "bottom" canInput={true} getValue={this.getValue}/>
                        <TextInput defaultValue = {data[area+"_left"]} name={area+"_left"} label = "left" canInput={true} getValue={this.getValue}/>
                    </div>
                :   <div className={styles["cellPadding"]+" "+styles["headPadding"]}>
                        <TextInput defaultValue = {data[area+"_top"]} name={area+"_top"} label = "top" canInput={true} getValue={this.getValue}/>
                        <TextInput defaultValue = {data[area+"_bottom"]} name={area+"_bottom"} label = "bottom" canInput={true} getValue={this.getValue}/>
                    </div>}
            </div>
        )
    }
}

export default CellPaddingSetting;
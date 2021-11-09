import * as React from "react"
import Button from "../../Public/Button";
import styles from './index.module.less'

class ButtonGroup extends React.Component {
    //不同按钮产生的点击事件不同，因此将点击的回掉定义在上层函数。

    //点击确定的时候传递数据
    transData = () => {
        const {renderHead,renderData} = this.props
        const controlData = Object.assign(this.props.controlData,{"cellSize":this.props.cellSize});
        postMessage('insert',renderHead,renderData,controlData);
    }
    //点击取消的时候需要关闭窗口
    
    render(){
        return (
            <div className = {styles["buttonGroup"]} >
                <Button type = "secondary" label = "取消" />
                <Button label = "确定" transData={this.transData}/>
            </div>
        )
    }
}

export default ButtonGroup;
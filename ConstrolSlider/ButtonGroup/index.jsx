import * as React from "react"
import Button from "../../Public/Button";
import Modal from "../../Public/Modal";
import styles from './index.module.less'

class ButtonGroup extends React.Component {

    state = {
        createTemplate:false
    }

    createTemplate = ()=>{
        this.setState({
            createTemplate:!this.state.createTemplate
        })
    }

    //点击确定的时候传递数据
    transData = (renderHead,renderData,controlData,cellSize,modalName) => {
        return ()=>{
            // const newCellSize = this.newCellSize(this.props.table_ref,cellSize)
            const tableRows = this.props.table_ref.current.rows;
            let newCellSize = {};
            let newstHeightArr = [];
            for(let i=0;i<tableRows.length;i++){
                newstHeightArr.push(tableRows[i].offsetHeight)
            };
            newCellSize.width = cellSize.width;
            newCellSize.height = newstHeightArr;

            postMessage('insert',renderHead,renderData,controlData,newCellSize,modalName);
            // console.log(renderHead,renderData,controlData,newCellSize,modalName);
        }
    }
    //点击取消的时候需要关闭窗口
    
    render(){
        const {createTemplate} = this.state;
        const {renderHead,renderData,controlData,cellSize,updateData,modalName} = this.props;

        const storageData = {
            renderHead:renderHead,
            renderData:renderData,
            controlData:controlData,
            cellSize:cellSize
        }

        return (
            <div style={{position:"relative"}}>
                {createTemplate  
                    ? <Modal table_ref={this.props.table_ref} updateData={updateData} storageData={storageData} func = {this.createTemplate}  />
                    :   <div className = {styles["buttonGroup"]} >
                            <Button label = "创建为模板" type = "secondary" func = {this.createTemplate}/>
                            <Button label = "生成表格" func={this.transData(renderHead,renderData,controlData,cellSize,modalName)}/>
                        </div>
                }
            </div>
        )
    }
}

export default ButtonGroup;
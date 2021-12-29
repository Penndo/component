import * as React from "react";
import * as IDB from "../IDB";
import ToolTips from "../ToolTips";
import {v4 as uuidv4} from "uuid";

import closePng from "../../../images/close.png";

import styles from "./index.module.less";


const defaultStoreName = "defaultStore";
const historyStoreName = "historyStore";

class Options extends React.Component{

    handleClick = (e)=>{
        const value = e.currentTarget.innerHTML;
        this.props.selectOption(value)
    }

    deleteData = (keyValue,updateData)=>{
        return ()=>{
            console.log(keyValue)
            IDB.createIDB().then((db)=>{
                //从默认库中删除数据；
                IDB.deleteItem(db,defaultStoreName,keyValue);
                //从历史库中更新/删除数据；如果默认库中已经没有数据了，那么就删除。如果还有那么就更新为第一项的数据
                IDB.getAllValue(db,defaultStoreName).then((result)=>{
                    if(result.length){
                        IDB.update(db,historyStoreName,{id:1,history:result[result.length-1].title});
                    }else{
                        IDB.deleteItem(db,historyStoreName,1);
                    }
                    updateData();
                });
                
            })
            
        }

    }

    render(){
        const {options,close,updateData} = this.props;
        return(
            <ul>
                {
                    options.map((item)=>{
                        return (
                            <li key={uuidv4()} >
                                <p onMouseDown = {this.handleClick}>{item}</p>
                                {
                                    close ? 
                                        <div className={styles["closePart"]}>
                                            <img src={closePng} alt="closePng" onMouseDown={this.deleteData(item,updateData)}/>
                                            <div className={styles["toolTips"]}>
                                                <ToolTips  tips="删除模板" />
                                            </div>
                                        </div>
                                    : null
                                }

                            </li>
                        ) 
                    })
                }
            </ul>
        )

    }
}

export default Options;
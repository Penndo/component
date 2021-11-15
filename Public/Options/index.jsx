import * as React from "react"
import {v4 as uuidv4} from "uuid"
import "./index.module.less"

class Options extends React.Component{

    handleClick = (e)=>{
        const value = e.currentTarget.innerHTML;
        this.props.selectOption(value)
    }

    render(){
        const {options} = this.props;
        return(
            <ul>
                {
                    options.map((item,index)=>{
                        return (
                            <li key={uuidv4()} onMouseDown = {this.handleClick}>{item}</li>
                        ) 
                    })
                }
            </ul>
        )

    }
}

export default Options;
import * as React from "react"
import TextInput from "../../Public/TextInput";

class TableWidth extends React.Component {

    getValue = (name,value) => {
        this.props.getControlData(name,value)
    }

    render(){
        return (
            <div>
                <p>{this.props.type}</p>
                <TextInput defaultValue = {this.props.data} name="tableWidth" labelDisplay = "none" canInput={true} getValue = {this.getValue}/>
            </div>
        )
    }
}

export default TableWidth;
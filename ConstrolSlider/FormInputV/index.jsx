import * as React from "react"
import TextInput from "../../Public/TextInput";

class FormInputV extends React.Component {

    getValue = (name,value) => {
        this.props.getControlData(name,value)
    }

    render(){
        return (
            <div>
                <p>{this.props.type}</p>
                <TextInput defaultValue = {640} name="tableWidth" labelDisplay = "none" getValue = {this.getValue}/>
            </div>
        )
    }
}

export default FormInputV;
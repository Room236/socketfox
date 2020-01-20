import * as React from "react";

export interface TextBoxProps {
    placeholder?: string;
    onSubmit?(text: string): void;
}

export class TextBox extends React.Component<TextBoxProps, any> {

    private textRef: HTMLInputElement;

    public render() {
        return (
            <div className="text-box">
                <input ref={(ref) => this.textRef = ref }
                       type="text"
                       className="text-box__input"
                       placeholder={this.props.placeholder}
                       onKeyUp={this.onKeyUp.bind(this)} />
            </div>
        );
    }

    public get text(): string {
        return this.textRef.value;
    }

    private onKeyUp(event: React.KeyboardEvent): void {
        if (event.which === 13 && this.props.onSubmit) { // enter key, fire submit event
            this.props.onSubmit(this.textRef.value);
        }
    }

}

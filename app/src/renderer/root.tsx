import * as React from "react";
import {TextBox} from "./textBox";

export class Root extends React.Component<any, any> {

    private addressTextBox: TextBox;

    public render() {
        return (
            <div className="root">
                <div id="update-banner" className="banner" style={{ "display": "none" }}>
                    <i className="fa fa-asterisk"/>
                    <p className="banner__text">
                        A new update is available.
                        <span id="update-banner__install-prompt">
                            You can install it now or it can be installed when you quit.
                        </span>
                    </p>
                    <button id="restart" className="button button--inverse" title="Restart">
                        <i className="fa fa-undo"/>
                    </button>
                </div>
                <div className="nav">
                    <TextBox
                        ref={(ref) => {
                            // TODO: begone with this abomination
                            global["address"] = ref;
                            this.addressTextBox = ref;
                        }}
                        placeholder="Enter server address..."
                        onSubmit={this.onAddressSubmit.bind(this)}/>
                    <button id="connect" className="button" title="Connect">
                        <i className="fas fa-plug"/>
                    </button>
                    <button id="clear__button" className="button" title="Clear history">
                        <i className="fas fa-trash-alt"/>
                    </button>
                </div>
                <main className="row">
                    <div className="builder">
                        <p className="panel__title">Event builder</p>
                        <TextBox
                            ref={(ref) => {
                                // TODO: begone with this abomination
                                global["newEventName"] = ref;
                            }}
                            placeholder="Event name"/>
                        <div id="editor"/>
                        <div className="editor-buttons">
                            <button id="attach" className="button" title="Attach">
                                <i className="fas fa-paperclip"/>
                            </button>
                            <button id="send" className="button" title="Send">
                                <i className="fas fa-paper-plane"/>
                            </button>
                        </div>
                    </div>
                    <div className="log">
                        <div className="log__empty-message">No events</div>
                    </div>
                </main>
            </div>
        );
    }

    private onAddressSubmit(address: string): void {
        if (!global["active"]) { // not connected to server, establish connection
            global["connect"](address);
        } else { // socket is connected, disconnect
            global["disconnect"]();
        }
    }

}

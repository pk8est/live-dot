const path = require('path');
const ipc = require('electron').ipcRenderer
import socket from '../backend/socket';

import React, { Component, PropTypes } from 'react';
import Select from 'react-select';
import Lang from '../backend/language';

const channel = "selected-save-file-path-directory";

class SettingPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fileSavePath: "",
            activeIndex: 0,
            updateStatus: "applying",
            locale: {
                label: "语言",
                value: "zh-CN",
            }
        };
    }

    componentDidMount () {
        var self = this;
        ipc.removeAllListeners(channel).on(channel, this.setFileSavePath.bind(this));
        fetch(process.env.APP_PROXY_URL + '/getFileSavePath').then(function(res) {
            return res.json();
        }).then(function(data) {
            if(data.hasOwnProperty("path")){
                self.setState({fileSavePath: data.path});
            }
        });
    }

    setFileSavePath(event, path){
        console.info(path)
        if(path[0]){
            socket.emit("update-file-save-path", path[0]);
            this.setState({fileSavePath: path[0]});
        }
    }

    handleSelectFileSavePath(filePath){
        console.info("select file save path!")
        ipc.send('open-file-dialog', channel);
    }

    render() {
        const { activeIndex, updateStatus, locale } = this.state;
        const items = [
            { name: 'setting',   label: "设置" },
        ];
        const links = items.map((item, index) => {
            return (<li key={ index }
                        className={ activeIndex === index ? 'active' : '' }
                    ><a>{ item.label }</a></li>);
        });
        let updateText;
        if (updateStatus === 'checking') {
            updateText = Lang.get('settings.checking_update');
        } else if (updateStatus === 'downloading') {
            updateText = Lang.get('settings.downloading_update');
        } else if (updateStatus === 'applying') {
            updateText = Lang.get('settings.applying_update');
        } else {
            updateText = Lang.get('settings.check_update');
        }
        return (
            <div className="settings-container">
                <div className="settings">
                    <ul className="links">
                        { links }
                    </ul>
                    <div className="contents">
                        <section key="" id="">
                            <span className="section-title">文件保存路径</span>
                            <input type="text" className="input-file" disabled value={this.state.fileSavePath} name="fileSavePath"/> 
                            <button onClick={this.handleSelectFileSavePath.bind(this, this.state.fileSavePath)}>
                                选择路径
                            </button>
                        </section>
                        {/*<section key="export" id="export">
                                                    <span className="section-title">{ Lang.get('settings.export') }</span>
                                                    <button>
                                                        { Lang.get('settings.export_to_zip') }
                                                    </button>
                                                    <button>
                                                        { Lang.get('settings.export_to_surge') }
                                                    </button>
                                                </section>
                                                <section key="language" id="language">
                                                    <span className="section-title">{ Lang.get('settings.language') }</span>
                                                    <Select
                                                        clearable={ false }
                                                        searchable={ false }
                                                        className="language-select"
                                                        name={ locale.label }
                                                        value={ locale.value }
                                                        options={ Lang.getLocales() } />
                                                </section>
                                                <section key="about" id="about">
                                                    <span className="section-title">{ Lang.get('settings.about') }</span>
                                                    <span className="section-title">{ Lang.get('settings.current_version', APP_VERSION) }</span>
                                                    <button>
                                                        { Lang.get('settings.homepage') }
                                                    </button>
                                                    <button
                                                        disabled={ !!updateStatus }>
                                                        { updateText }
                                                    </button>
                                                </section>*/}
                    </div>
                </div>
            </div>
        );
    }
}

SettingPage.propTypes = {
    manifest: PropTypes.object,
};

export default SettingPage;

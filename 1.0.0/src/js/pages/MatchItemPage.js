const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import filesize from 'filesize';
import config from '../../server/config';


class MatchItemPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {

    }

    getStatus(status){
        let statusArr = {
            0: {name: "未开始", className:""},
            1: {name: "进行中", className:" label-info"},
            9: {name: "已结束", className:" label-success"},
            "-1": {name: "暂停", className:" label-important"},
            "-9": {name: "已取消", className:" label-inverse"},
        };
        if(statusArr.hasOwnProperty(status)){
            return statusArr[status];
        }else{
            return {};
        }

    }

    handlerOpenLive(option){
        ipcRenderer.send("open-live-window", option);
    }

    renderMatchList(list){
        let self = this;
        return list.map((item, index) => {
            let button = "";
            let status = self.getStatus(item.status);
            let statusText = <button className={status.className} disabled>{status.name}</button> 
            return (
                <section>
                    <span className="label-title">第 {index+1} 场</span>
                    <span className="">
                        <input type="text" className="input-file" disabled value={item.title}/>
                        { statusText }
                        <button onClick={self.handlerOpenLive.bind(self, item)}>直播</button> 
                    </span>
                </section>
            );
        });
    }

	render() {
        const self = this;
        const {item} = this.props;

		return (
			<div className="active-item">
                <div className="title">
                    <span>
                        <img src={item.home_team_info.logo}/>
                        {item.home_team_info.team_name}
                        &nbsp;&nbsp;&nbsp;&nbsp;VS&nbsp;&nbsp;&nbsp;&nbsp; 
                        {item.guest_team_info.team_name}
                        <img src={item.guest_team_info.logo}/>
                    </span>
                </div>
                <div className="title">
                    <span>
                        <code>{item.home_team_win}</code>
                        &nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp; 
                        <code>{item.guest_team_win}</code>
                    </span>
                </div>
                <section>
                    <span className="label-title">比赛时间</span>
                    <span className="label-content"><code>{item.start_time}</code> - <code>{item.end_time}</code></span>
                </section>

                { self.renderMatchList(item.match_list) } 

            </div>
		);
	}

}

MatchItemPage.propTypes = {
    item: PropTypes.object,
    active: PropTypes.bool,
};

export default MatchItemPage;

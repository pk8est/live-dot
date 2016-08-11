const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
import React, { Component, PropTypes } from 'react';
import config from '../../server/config';
import live from '../backend/live';
import moment from 'moment';
import $ from 'jquery';
import VideoListPage from './VideoListPage';


class LiveManagerPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            match_id: 0,
            list: [],
        };
    }

    componentDidMount() {
        let self = this;
        ipcRenderer.on("send-live-mid", function(event, id){
            self.getMatchMessage(id);
        });
        ipcRenderer.on("live-window-resize", function(event, options){
            self.fixHeight(options[1]);
        });
    }

    componentDidUpdate(){
        this.scrollBottom();
    }

    fixHeight(winHeight){
        $('.live-list').height(winHeight - 200);
        $('.resource-video-box .box').height(winHeight - 200);
    }

    getMatchMessage(id){
        let self = this;
        this.setState({match_id: id});
        fetch(config.FRONTEND_HOST + '?r=match/getmatchmessage&create_time=1&match_id='+id)
        .then(function(res) {
            return res.json();
        }).then(function(data) {
            if(data.hasOwnProperty("code") && data.code==1){
                self.setState({
                    list: data.result.data,
                });
            }
        });
    }

    handlerSendMessage(){
        let self = this;
        let message = document.getElementById("message").value;
        if(message){
            live.sendMessage({
                r: "live/sendmessage",
                match_id: this.state.match_id,
                message: message,
            }, function(error, message, data){
                if(error){
                    alert(message);
                }else{
                    self.appendMessage(data)
                    self.clearInput();
                }
            });
        }
    }

    appendMessage(item){
        let list = this.state.list
        list.push(item);
        this.setState({list: list});
        this.scrollBottom();
    }

    scrollBottom(){
        $(".live-list").animate({scrollTop: $(".live-list")[0].scrollHeight}, 100);
    }

    clearInput(){
        document.getElementById("message").value = "";
    }

    handlerSendVideo(video){
        let self = this;
        if(!video) return alert("请选择一个视频");
        if(video.can_play!=1) return alert("视频还没有转码，请等待转码完成后再操作");
        let title = document.getElementById("video-title").value;
        live.sendMessage({
            r: "live/sendvideo",
            match_id: self.state.match_id,
            vid: video.vid,
            title: title,
        }, function(error, message, data){
            if(error){
                alert(message);
            }else{
                self.appendMessage(data)
            }
        });
    }

    renderList(list){
        let self = this;
        return list.map((item, index) => {
            let time = moment(item.create_time * 1000).format("YYYY-MM-DD HH:mm:ss");
            let screenshot = item.screenshot ? <img src={item.screenshot}/> : "";
            let video = item.video_url ? (<video controls><source src={item.video_url} type="video/mp4"/></video>) : "";
            let content = item.content ? item.content : "";
            return (
                <div className="live-item">
                    <pre>
                        <div className="live-time text-center"><code>{time}</code></div>
                        <div className="live-screenshot">{screenshot}</div>
                        <div className="live-video">{video}</div>
                        <div className="live-content">{content}</div>
                    </pre>
                </div>
            )
        });
    }

    renderInput(){
        return (
            <div className="live-input">
                <textarea rows="6" id="message"></textarea>
                <button className="btn btn-info pull-right" onClick={this.handlerSendMessage.bind(this)}>发送</button>
            </div>
        )
    }

	render() {
        const {list} = this.state;
		return (
			<div className="live-container">
                <div className="live-resource">
                    <VideoListPage parent={this} handlerSendVideo={this.handlerSendVideo}/>
                </div>
                <div className="live-manager">
                    <div className="live-content">
                        <div className="live-list">
                            { this.renderList(list) }
                        </div>
                    </div>
                    <div className="live-form">
                        { this.renderInput() }
                    </div>
                </div>
            </div>
		);
	}

}

LiveManagerPage.propTypes = {

};

export default LiveManagerPage;

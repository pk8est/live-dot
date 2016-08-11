import React, { Component, PropTypes } from 'react';
import fetch from 'node-fetch';
import config from '../../server/config';
import classnames from 'classnames';
import $ from 'jquery';
import util from "../utils/util";


class VideoListPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            active: 0,
            activeItem: null,
        };
        this.udb = util.getUDB();
    }

    componentDidMount() {
        this.getUploadList();
    }

    componentDidUpdate(){
        this.setVideoTitle();
    }

    setVideoTitle(){
        if(this.state.activeItem != null){
            document.getElementById("video-title").value = this.state.activeItem.video_title;
        }
    }

    getUploadList(){
        let self = this;
        fetch(config.FRONTEND_HOST + `?r=video/getuploadlist&udb=`+self.udb)
        .then(function(res) {
            return res.json();
        }).then(function(json) {
            if(json.hasOwnProperty("code") && json.code==1){
                let activeItem = self.state.activeItem;
                if(activeItem != null){
                    json.result.map((item, index)=>{
                        if(item.vid == activeItem.vid){
                            activeItem = item;
                        }
                    })
                }
                self.setState({list: json.result, activeItem: activeItem});
            }
        });
    }

    handlerSelectVideo(item, event){
        this.setState({active: item.vid, activeItem: item})
    }


    renderInfo(){
        let item = this.state.activeItem;
        if(item == null) return "";
        let statusButton, submitButton = ""; 
        if(item.can_play == 1 ){
            submitButton = <button onClick={this.props.handlerSendVideo.bind(this.props.parent, item)} className="btn btn-info pull-right">插入</button>;
            statusButton = <span className="label label-large label-success">已转码</span>;
        }else{
            submitButton = <button onClick={this.props.handlerSendVideo.bind(this.props.parent, item)} disabled className="btn btn-info pull-right disabled">插入</button>;
            statusButton = <span className="label label-inverse">未转码</span>;
        }
        return (
            <div className="video-info">
                <div className="video-info-id">VID: <code>{item.vid}</code> { statusButton } </div>
                <div className="video-info-title"> <textarea rows="4" id="video-title" defaultValue={item.video_title}></textarea> </div>
                <div className="video-info-button"> {submitButton} </div>
            </div>
        )
    }
    renderList(list){
        let self = this;
        return list.map((item, index) => {
            let title = item.video_title || item.video_name;
            const classNames = classnames({
                'active': self.state.active == item.vid ? true : false,
            });
            return (
                <div className="video-item">
                    <a className={classNames} title={title} onClick={self.handlerSelectVideo.bind(this, item)} href="#">{ item.vid }. {title} </a>
                </div>
            )
        });
    } 

    render() {
        const {list} = this.state;
        return (
            <div className="resource-video-box">
                <div className="box-title">视频列表 <i onClick={this.getUploadList.bind(this)} className="fa fa-refresh" aria-hidden="true"></i> </div>
                <div className="box">
                    <div className="box-list">
                        { this.renderList(list) }
                    </div>
                </div>
                <div className="box-info">
                    { this.renderInfo() }
                </div>
            </div>
        );
    }

}

VideoListPage.propTypes = {
    parent: PropTypes.object,
    handlerSendVideo: PropTypes.func,
};

export default VideoListPage;

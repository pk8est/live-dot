import React from 'react';
import fs from 'fs';
const remote = require('electron').remote

var desktopCapturer = require('electron').desktopCapturer;

var desktopCapturer = require('electron').desktopCapturer;

function gotStream(stream) {
  document.querySelector('video').src = URL.createObjectURL(stream);
}

function getUserMediaError(e) {
  console.log('getUserMediaError');
}

class ScreenPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            src: "",
            sources: [],
        }; 
    }

    componentDidMount() {
        var self = this;
        desktopCapturer.getSources({types: ['window', 'screen']}, function(error, sources) {
            if (error) throw error;
            //console.info(sources)
            self.setState({ sources: sources });
        });
    }

    screenVideo(id) {
        var self = this;
        console.info(id)
        navigator.webkitGetUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: id,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720
                }
            }
        }, function(stream){
            self.setState({ src: URL.createObjectURL(stream) });
            console.info( stream)
            console.info( URL.createObjectURL(stream))
        }, function(e){

        });
    }

	render() {
        var self = this;
        var SourceComponent = this.state.sources.map(function (source) {
            return (
                <div className="col-sm-6 col-md-4">
                    <div className="thumbnail">
                        <img src={source.thumbnail.toDataURL()} />
                        <div className="caption">
                            <h3>{source.name}</h3>
                            <p>{source.id}</p>
                            <p>
                                <button className="btn btn-default" role="button" onClick={self.screenVideo.bind(self, source.id)}>录屏</button>
                            </p>
                        </div>
                    </div>
                </div>
            );
        });

		return (
            <div classNmae="row">
                {/*<video id="playerOneVideo" src={this.state.src} ></video>
                                { SourceComponent }*/}
                 <div className="well">
                    <p>1. 解压压缩包</p>
                    <p>2. 双击<code>Setup.exe</code>安装应用程序</p>
                    <p>3. 在chrome浏览器打开地址：<code>chrome://extensions/</code></p>
                    <p>4. 拖动整个文件夹<code>chrome-plugin</code>到chrome中</p>
                    <p>5. 在桌面点击已经安装好的图标<code>electron</code>，打开应用</p>
                    <p>6. 在chrome浏览器打开直播网站，目前支持虎牙(仅直播线路1)，斗鱼，龙珠，熊猫，战旗，可能由于官方规则更改，上面网站的直播抓取不到。</p>
                    <p>7. 通过快捷键<kbd><kbd>ctrl</kbd> + <kbd>shift</kbd> + <kbd>7</kbd> </kbd>截取已经抓取到的直播流，可自行通过修改chrome快捷键更改设置</p>
                </div>
            </div>
		);
	}
}

export default ScreenPage;

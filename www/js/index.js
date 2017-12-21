/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

        var openFileButton = document.getElementsByClassName("open-file-button");
        var captureAudioButton = document.getElementsByClassName("capture-audio");
        var captureVideoButton = document.getElementsByClassName("capture-video");

        if (openFileButton.length) {
            openFileButton[0].addEventListener("click", this.onClickOpenFileButton.bind(this), false);
        }
        if (captureAudioButton.length) {
            captureAudioButton[0].addEventListener("click", this.onClickCaptureAudioButton.bind(this), false);
        }
        if (captureVideoButton) {
            captureVideoButton[0].addEventListener("click", this.onClickCaptureVideoButton.bind(this), false);
        }
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        console.log(navigator.device);
        this.receivedEvent('deviceready');

        // pendingcaptureresult is fired if the capture call is successful
        document.addEventListener('pendingcaptureresult', function (mediaFiles) {
            console.log('pendingcaptureresult', mediaFiles);
        });

        // pendingcaptureerror is fired if the capture call is unsuccessful
        document.addEventListener('pendingcaptureerror', function (error) {
            console.log('pendingcaptureerror', error);
        });
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');
        //
        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    onClickCaptureVideoButton: function () {
        var options = {duration: 10};

        if (!navigator.device) {
            navigator.notification.alert("navigator.device  undefined", null, "Error");
            return;
        }
        navigator.device.capture.captureVideo(
            this.captureVideoSuccess, this.captureError, [options]
        );
    },

    captureVideoSuccess: function (e) {
        console.log('captureVideoSuccess');
        console.dir(e);

        var video = {};
        video.file = e[0].localURL;
        video.filePath = e[0].fullPath;


        if (!video.file) {
            navigator.notification.alert("Record a video first.", null, "Error");
            return;
        }

        function completeCallback() {
            console.log(' VideoPlayer completeCallback');
        }

        function errorCallback(e) {
            console.log(' VideoPlayer errorCallback ', e);
        }

        var options = {volume: 0.5};
        VideoPlayer.play(video.file, [options], [completeCallback], [errorCallback]);
    },

    onClickCaptureAudioButton: function () {
        var options = {duration: 10};

        if (!navigator.device) {
            navigator.notification.alert("navigator.device  undefined", null, "Error");
            return;
        }
        navigator.device.capture.captureAudio(
            this.captureSuccess, this.captureError, [options]
        );
    },

    captureSuccess: function (e) {
        console.log('captureSuccess');
        console.dir(e);

        var sound = {};
        sound.file = e[0].localURL;
        sound.filePath = e[0].fullPath;

        if (!sound.file) {
            navigator.notification.alert("Record a sound first.", null, "Error");
            return;
        }


        var media = new Media(sound.file, function () {
            media.release();
        }, function (err) {
            console.log("media err", err);
        });

        media.play();
    },

    captureError:

        function (e) {
            console.log('captureError ', e);
        }

    ,


    // var playSound = function(x) {
    //     getSounds().then(function(sounds) {
    //         var sound = sounds[x];
    //
    //         /*
    //         Ok, so on Android, we just work.
    //         On iOS, we need to rewrite to ../Library/NoCloud/FILE
    //         */
    //         var mediaUrl = sound.file;
    //         if(device.platform.indexOf("iOS") >= 0) {
    //             mediaUrl = "../Library/NoCloud/" + mediaUrl.split("/").pop();
    //         }
    //         var media = new Media(mediaUrl, function(e) {
    //             media.release();
    //         }, function(err) {
    //             console.log("media err", err);
    //         });
    //         media.play();
    //     });
    // }

    onClickOpenFileButton: function () {
        console.log('OpenFileButton Click');

        this.cameraGetPicture();
    }
    ,

    cameraGetPicture: function () {
        var cameraOptions = {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 1024, targetHeight: 1024
        };

        navigator.camera.getPicture(this.cameraSuccess.bind(this), this.cameraError.bind(this), cameraOptions);
    }
    ,

    cameraSuccess: function (url) {
        console.log('photo loaded...');
        console.log(url);

        if (device.platform === "Android") {
            this.resoolveNativePathAndThenOpenALPRScan(url);
        } else {
            this.openALPRScan(url);
        }

        return false;
    }
    ,

    cameraError: function (e) {
        console.log('Error photo loading: ', e);

        return false;
    }
    ,

    openALPRScan: function (url) {
        var resultText = document.getElementsByClassName('result-text')[0];
        var resultMessage = 'data not recognized';

        function successScan(data) {
            if (data.length) {
                resultMessage = JSON.stringify(data);
            }

            resultText.value = resultMessage;
            console.log(resultMessage);
        }

        function errorScan(error) {
            resultMessage = error.code + ': ' + error.message;
            resultText.value = resultMessage;

            console.log(resultMessage);
        }

        cordova.plugins.OpenALPR.scan(url, successScan, errorScan);
    }
    ,

    resoolveNativePathAndThenOpenALPRScan: function (url) {
        function onSuccess(result) {
            this.openALPRScan(result);
        }

        function onError(error) {
            console.log("resolveNativePath error", error);
        }

        window.FilePath.resolveNativePath(url, onSuccess.bind(this), onError.bind(this));
    }
};

app.initialize();
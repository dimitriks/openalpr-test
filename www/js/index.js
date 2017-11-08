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
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

        var openFileButton = document.getElementsByClassName("open-file-button");

        openFileButton[0].addEventListener("click", this.onClickOpenFileButton.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');
        //
        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    onClickOpenFileButton: function() {
        console.log('OpenFileButton Click');

        this.cameraGetPicture();
    },

    cameraGetPicture: function () {
        var cameraOptions = {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 1024, targetHeight: 1024
        };

        navigator.camera.getPicture(this.cameraSuccess.bind(this), this.cameraError.bind(this), cameraOptions);
    },

    cameraSuccess: function (url) {
        console.log('photo loaded...');
        console.log(url);

        if (device.platform === "Android") {
            this.resoolveNativePathAndThenOpenALPRScan(url);
        } else {
            this.openALPRScan(url);
        }

        return false;
    },

    cameraError: function (e) {
        console.log('Error photo loading: ', e);

        return false;
    },

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
    },

    resoolveNativePathAndThenOpenALPRScan: function (url) {
        function onSuccess(result) {
            this.openALPRScan(result);
        }

        function onError(error) {
            logger.debug("resolveNativePath error", error);
        }

        window.FilePath.resolveNativePath(url, onSuccess.bind(this), onError.bind(this));
    }
};

app.initialize();
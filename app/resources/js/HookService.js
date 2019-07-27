/* Copyright 2013-2017 Extended Mind Technologies Oy
 *
 * All rights reserved.
 */

'use strict';

/* global angular, pauseExtendedMindAnimation, extendedMindAudio, setupHTML5Audio, extendedMindAnimationDelay,
playExtendedMindAnimation, extendedMindAnimationPhase, Media, cordova */
function HookService($q, AnalyticsService, packaging) {


  function setInboxId(inboxId){
    return $q(function(resolve, reject) {
      if (window.AppGroupsUserDefaults){
        var options = {
              key: 'inboxId',
              value: inboxId,
              suite: 'group.org.extendedmind'};
        window.AppGroupsUserDefaults.save(options, function(){
          resolve();
        }, function(){
          reject('error saving');
        });
      }else{
        reject('invalid configuration');
      }
    });
  }

  // EXTENDED MIND ANIMATION

  function getAudioUrl(){
    if (packaging === 'android-cordova'){
      return 'file:///android_asset/www/' + entryControllerScope.urlBase + 'audio/theme.mp3';
    }else if (packaging === 'ios-cordova'){
      return entryControllerScope.urlBase + 'audio/theme.mp3';
    }
  }

  function animationEndCallback(){
    AnalyticsService.do('entry', 'animation_end');
  }

  // Pause animation when entering background, not really working on iOS
  function pauseCallback(){
    if (extendedMindAudio && extendedMindAnimationPhase !== undefined){
      pauseExtendedMindAnimation();
    }
  }


  var audioReady, sloganReady, logoReady, slidesReady;
  function initializeEntryControllerScope(entryControllerScope){

    entryControllerScope.useHTML5Audio = function(){
      if (!packaging.endsWith('cordova')){
        return true;
      }
    };

    entryControllerScope.playExtendedMindAnimation = function(){
      if (!extendedMindAudio){
        if (entryControllerScope.useHTML5Audio()){
          setupHTML5Audio(animationEndCallback);
        }else if (Media){
          var src = getAudioUrl();
          entryControllerScope.theme = new Media(src, function(){
            if (extendedMindAudio !== undefined) extendedMindAudio.ended = true;
          });
          extendedMindAudio = {
            ended: false,
            play: function(){
              entryControllerScope.theme.play();
            },
            pause: function(){
              entryControllerScope.theme.pause();
            },
            muted: false,
            setVolume: function(volume){
              entryControllerScope.theme.setVolume(volume);
            },
            readyState: 1,
            HAVE_FUTURE_DATA: 1,
            endCallback: animationEndCallback
          };
          // Start off with a very quiet volume, volume is added gradually as animation progresses
          extendedMindAudio.setVolume(0.05);
        }
      }
      if (packaging === 'android-cordova'){
        extendedMindAnimationDelay = 0.1;
      }
      else if (packaging === 'ios-cordova'){
        extendedMindAnimationDelay = 0.05;
      }
      AnalyticsService.do('entry', 'animation_play');
      playExtendedMindAnimation();
    };

    audioReady = !entryControllerScope.useHTML5Audio();
    entryControllerScope.notifyAnimationReady = function(type){
      if (type === 'audio') audioReady = true;
      else if (type === 'slogan') sloganReady = true;
      else if (type === 'logo') logoReady = true;
      else if (type === 'slides') slidesReady = true;
      if (audioReady && sloganReady && logoReady && slidesReady &&
          UISessionService.getTransientUIState() !== 'loggedOut'){
        $timeout(function(){
          if (entryControllerScope.entryState !== 'login'){
            entryControllerScope.playExtendedMindAnimation();
          }
        }, 1000);
      }
    };

    entryControllerScope.toggleVolume = function(clickEvent){
      extendedMindAudio.muted = !extendedMindAudio.muted;
      if (!entryControllerScope.useHTML5Audio()){
        if (extendedMindAudio.muted) entryControllerScope.theme.setVolume('0.0');
        else entryControllerScope.theme.setVolume('1.0');
      }
      var volumeElem = document.getElementById("volume");
      if (extendedMindAudio.muted){
        volumeElem.className = 'icon-volume-up';
      }else {
        volumeElem.className = 'icon-volume-mute';
      }
      if (clickEvent){
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
      }
      return false;
    };

    if (packaging.endsWith('cordova')){
      document.addEventListener('pause', pauseCallback, false);
      entryControllerScope.$on('$destroy', function() {
        document.removeEventListener('pause', pauseCallback, false);
      });
    }
    return true;
  }

  function startEntryTutorial(entryControllerScope){
    // Manually kill sound at this stage to prevent audio from leaking to tutorial
    if (typeof extendedMindAudio !== 'undefined' && extendedMindAudio &&
        angular.isFunction(extendedMindAudio.pause)){
      extendedMindAudio.pause();
    }
  }

  function swipeToEntryLogin(entryControllerScope){
    if (angular.isFunction(pauseExtendedMindAnimation)) pauseExtendedMindAnimation();
  }

  return {
    setInboxId: setInboxId,
    initializeEntryControllerScope: initializeEntryControllerScope,
    startEntryTutorial: startEntryTutorial,
    swipeToEntryLogin: swipeToEntryLogin
  };
}
HookService['$inject'] = ['$q', 'AnalyticsService', 'packaging'];
angular.module('em.base').factory('HookService', HookService);

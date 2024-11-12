import { LConnectionKind } from "@gausszhou/litegraph-core/src/types";


class LGAudio {
  // 音频上下文
  private static _audio_context;
  // 包含已加载音频的 AudioBuffer 格式的解码样本
  static cached_audios = {};
  // 允许设置一个回调函数
  static onProcessAudioURL: any;

  static getAudioNodeInOutputSlot

  static audionode;

  static graph
  static currentBuffer

  static getAudioContext(): AudioContext {
    if (!this._audio_context) {
      window.AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!window.AudioContext) {
        console.error("AudioContext not supported by browser");
        return null;
      }
      this._audio_context = new AudioContext();
      this._audio_context.onmessage = function (msg) {
        console.log("msg", msg);
      };
      this._audio_context.onended = function (msg) {
        console.log("ended", msg);
      };
      this._audio_context.oncomplete = function (msg) {
        console.log("complete", msg);
      };
    }
    return this._audio_context;
  }

  /**
   * 连接两个音频节点
   * @param audionodeA
   * @param audionodeB
   */
  static connect(audionodeA, audionodeB) {
    try {
      audionodeA.connect(audionodeB);
    } catch (err) {
      console.warn("LGraphAudio:", err);
    }
  }

  /**
   * 断开两个音频节点的连接
   * @param audionodeA
   * @param audionodeB
   */

  static disconnect(audionodeA, audionodeB) {
    try {
      audionodeA.disconnect(audionodeB);
    } catch (err) {
      console.warn("LGraphAudio:", err);
    }
  }

  static changeAllAudiosConnections(node, connect) {
    if (node.inputs) {
      for (var i = 0; i < node.inputs.length; ++i) {
        var input = node.inputs[i];
        var link_info = node.graph.links[input.link];
        if (!link_info) {
          continue;
        }

        var origin_node = node.graph.getNodeById(link_info.origin_id);
        var origin_audionode = null;
        if (origin_node.getAudioNodeInOutputSlot) {
          origin_audionode = origin_node.getAudioNodeInOutputSlot(
            link_info.origin_slot
          );
        } else {
          origin_audionode = origin_node.audionode;
        }

        var target_audionode = null;
        if (node.getAudioNodeInInputSlot) {
          target_audionode = node.getAudioNodeInInputSlot(i);
        } else {
          target_audionode = node.audionode;
        }

        if (connect) {
          LGAudio.connect(origin_audionode, target_audionode);
        } else {
          LGAudio.disconnect(origin_audionode, target_audionode);
        }
      }
    }

    if (node.outputs) {
      for (var i = 0; i < node.outputs.length; ++i) {
        var output = node.outputs[i];
        for (var j = 0; j < output.links.length; ++j) {
          var link_info = node.graph.links[output.links[j]];
          if (!link_info) {
            continue;
          }

          var origin_audionode = null;
          if (node.getAudioNodeInOutputSlot) {
            origin_audionode = node.getAudioNodeInOutputSlot(i);
          } else {
            origin_audionode = node.audionode;
          }

          var target_node = node.graph.getNodeById(link_info.target_id);
          var target_audionode = null;
          if (target_node.getAudioNodeInInputSlot) {
            target_audionode = target_node.getAudioNodeInInputSlot(
              link_info.target_slot
            );
          } else {
            target_audionode = target_node.audionode;
          }

          if (connect) {
            LGAudio.connect(origin_audionode, target_audionode);
          } else {
            LGAudio.disconnect(origin_audionode, target_audionode);
          }
        }
      }
    }
  }

  //used by many nodes
  static onConnectionsChange(connection, slot, connected, link_info) {
    //only process the outputs events
    if (connection != LConnectionKind.OUTPUT) {
      return;
    }

    var target_node = null;
    if (link_info) {
      target_node = this.graph.getNodeById(link_info.target_id);
    }

    if (!target_node) {
      return;
    }

    //get origin audionode
    var local_audionode = null;
    if (this.getAudioNodeInOutputSlot) {
      local_audionode = this.getAudioNodeInOutputSlot(slot);
    } else {
      local_audionode = this.audionode;
    }

    //get target audionode
    var target_audionode = null;
    if (target_node.getAudioNodeInInputSlot) {
      target_audionode = target_node.getAudioNodeInInputSlot(
        link_info.target_slot
      );
    } else {
      target_audionode = target_node.audionode;
    }

    //do the connection/disconnection
    if (connected) {
      LGAudio.connect(local_audionode, target_audionode);
    } else {
      LGAudio.disconnect(local_audionode, target_audionode);
    }
  }

  /**
   * 给每个音频节点注册两个回调函数 onPropertyChanged 和 onConnectionsChange
   * @param class_object 
   */
  static createAudioNodeWrapper(class_object) {
    var old_func = class_object.prototype.onPropertyChanged;

    class_object.prototype.onPropertyChanged = function (name, value) {
      if (old_func) {
        old_func.call(this, name, value);
      }

      if (!this.audionode) {
        return;
      }

      if (this.audionode[name] === undefined) {
        return;
      }

      if (this.audionode[name].value !== undefined) {
        this.audionode[name].value = value;
      } else {
        this.audionode[name] = value;
      }
    };

    class_object.prototype.onConnectionsChange = LGAudio.onConnectionsChange;
  }

  static loadSound(url, on_complete, on_error?) {
    if (LGAudio.cached_audios[url] && url.indexOf("blob:") == -1) {
      if (on_complete) {
        on_complete(LGAudio.cached_audios[url]);
      }
      return;
    }

    if (LGAudio.onProcessAudioURL) {
      url = LGAudio.onProcessAudioURL(url);
    }

    //load new sample
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var context = LGAudio.getAudioContext();

    // Decode asynchronously
    request.onload = function () {
      console.log("AudioSource loaded");
      context.decodeAudioData(
        request.response,
        function (buffer) {
          console.log("AudioSource decoded");
          LGAudio.cached_audios[url] = buffer;
          LGAudio.currentBuffer = buffer;
          if (on_complete) {
            on_complete(buffer);
          }
        },
        onError
      );
    };
    request.send();

    function onError(err) {
      console.log("Audio loading sample error:", err);
      if (on_error) {
        on_error(err);
      }
    }

    return request;
  }
}

(window as any).LGAudio = LGAudio;

export default LGAudio;

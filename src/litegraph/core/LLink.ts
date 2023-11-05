export interface LLinkInfo {
  id: number;
  type: string;
  origin_id: number;
  origin_slot: number;
  target_id: number;
  target_slot: number;
}

// this is the class in charge of storing link information
// 这是负责存储连接线信息的类

class LLink {
  id: number = 0;
  type: string = "";
  origin_id: number = 0;
  origin_slot: number = 0;
  target_id: number = 0;
  target_slot: number = 0;
  data: any = {};
  private _data: any = null;
  _last_time = 0;
  constructor() {
  }
  configure(o: LLinkInfo) {
    if (o.constructor === Array) {
      this.id = o[0];
      this.origin_id = o[1];
      this.origin_slot = o[2];
      this.target_id = o[3];
      this.target_slot = o[4];
      this.type = o[5];
    } else {
      this.id = o.id;
      this.type = o.type;
      this.origin_id = o.origin_id;
      this.origin_slot = o.origin_slot;
      this.target_id = o.target_id;
      this.target_slot = o.target_slot;
    }
  };
  serialize() {
    return [this.id, this.origin_id, this.origin_slot, this.target_id, this.target_slot, this.type];
  };
}

export default LLink;

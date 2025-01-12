class peerService{
    constructor(){
        if(!this.peer){
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [

                        ]
                    }
                ]
            })
        }
    }

    async getOffer(){
        if(this.peer){
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }

    async getAnsweer(offer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(offer);
            const ans = this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans;
        }
    }
}

export default new peerService();
use serde::{
    Deserialize,
    Serialize,
};
use super::{
    PacketId,
    SessionId,
};
pub const PROTOCOL_VERSION: u16 = 1;
#[derive(
    Debug,
    Clone,
    Copy,
    Serialize,
    Deserialize,
)]
pub enum PacketType {
    Discover,
    DiscoverResponse,
    PairRequest,
    PairAccept,
    PairReject
    SessionCreate,
    SessionReady,
    SessionClose,
    Manifest,
    Chunk,
    ChunkAck,
    ResumeRequest,
    ResumeResponse,
    Ping,
    Pong,
    Error,
}
#[derive(
    Debug,
    Clone,
    Copy,
    Serialize,
    Deserialize
)]
pub struct PacketFlags{
    fn default() -> Self {
        Self {
            encrypted: false,
            compressed: false,
            reliable: true,
        }
    }
}
#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct PacketHeader {
    pub version: u16,
    pub packet_type: PacketType,
    pub packet_id: PacketId,
    pub session_id: Option<SessionId>,
    pub payload_size: u32,
    pub flags: PacketFlags,
}

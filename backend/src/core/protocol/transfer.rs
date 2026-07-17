use serde::{
    Serialize,
    Deserialize,
};
use super::TransferId;

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct FileEntry {
    pub name: String,
    pub size: u64,
    pub hash: String,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct Manifest {
    pub transfer_id: TransferId,
    pub files: Vec<FileEntry>,
    pub total_size: u64
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct Chunk {
    pub transfer_id: TransferId,
    pub index: u64,
    pub total_chunks: u64,
    pub data: Vec<u8>,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct ChunkAck {
    pub transfer_id: TransferId,
    pub index: u64,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct ResumeRequest{
    pub transfer_id: TransferId,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct ResumeResponse {
    pub transfer_id: TransferId,
    pub next_chunk: u64,
}
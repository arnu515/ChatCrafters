CREATE TABLE personas (
	id text primary key,
	name text not null,
	summary text not null,
	model text CHECK (model in ('@cf/tinyllama/tinyllama-1.1b-chat-v1.0', '@cf/meta/llama-2-7b-chat-int8', '@hf/mistralai/mistral-7b-instruct-v0.2')) not null,
	prompt text not null,
	attire text not null,
	userId text not null REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);


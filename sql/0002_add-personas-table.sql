CREATE TABLE personas (
	id text primary key,
	name text not null,
	summary text not null,
	model text not null,
	prompt text not null,
	attire text not null,
	userId text not null REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);


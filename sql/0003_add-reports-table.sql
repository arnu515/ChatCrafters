CREATE TABLE reports (
	id text primary key,
	report text not null,
	personaId text references personas(id) ON DELETE CASCADE ON UPDATE CASCADE,
	userId text references users(id) ON DELETE CASCADE ON UPDATE CASCADE
);


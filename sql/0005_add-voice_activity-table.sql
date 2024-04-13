CREATE TABLE voice_activity (
	userId text primary key references users(id) on delete cascade on update cascade,
	amount int not null default 0,  -- in seconds
	d text not null default CURRENT_DATE  -- iso 8601 date string (YYYY-MM-DD)
);


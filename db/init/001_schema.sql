CREATE TABLE collections {
    col_id UUID PRIMARY KEY gen_random_uuid(),
    col_name VARCHAR(24),
    col_desc VARCHAR(255),
    
}

CREATE TABLE locations {
    loc_id UUID PRIMARY KEY gen_random_uuid(),
    col_id UUID,
    loc_latitude FLOAT,
    loc_longitude FLOAT,
}
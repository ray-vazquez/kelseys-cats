ALTER TABLE vfv_cats ADD COLUMN color VARCHAR(100) DEFAULT NULL AFTER breed;
ALTER TABLE vfv_cats ADD COLUMN hair_length VARCHAR(50) DEFAULT NULL AFTER color;
ALTER TABLE vfv_cats ADD COLUMN good_with_cats BOOLEAN DEFAULT NULL AFTER hair_length;
ALTER TABLE vfv_cats ADD COLUMN good_with_dogs BOOLEAN DEFAULT NULL AFTER good_with_cats;
ALTER TABLE vfv_cats ADD COLUMN good_with_kids BOOLEAN DEFAULT NULL AFTER good_with_dogs;
ALTER TABLE vfv_cats ADD COLUMN spayed_neutered BOOLEAN DEFAULT NULL AFTER good_with_kids;
ALTER TABLE vfv_cats ADD COLUMN shots_current BOOLEAN DEFAULT NULL AFTER spayed_neutered;
ALTER TABLE vfv_cats ADD COLUMN special_needs BOOLEAN DEFAULT NULL AFTER shots_current;

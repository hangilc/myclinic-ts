set names utf8;

insert into patient 
    (last_name, first_name, last_name_yomi, first_name_yomi,
    sex, birth_day, address, phone)
    values
    ('診療', '太郎', 'しんりょう', 'たろう',
    'M', '2001-03-27', '東京', '03-1234-5678'),
    ('看護', '花子', 'かんご', 'はなこ',
    'F', '2012-10-3', '東京', '03-4321-8765')
    ;

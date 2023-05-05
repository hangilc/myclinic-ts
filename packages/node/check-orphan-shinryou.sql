select s.shinryoucode from visit_shinryou as s inner join visit as v on s.visit_id = v.visit_id 
    left outer join shinryoukoui_master_arch as m on s.shinryoucode = m.shinryoucode
    where m.valid_from <= date(v.v_datetime) 
    and (m.valid_upto = '0000-00-00' or date(v.v_datetime) <= m.valid_upto)
    and m.shinryoucode is null
    group by s.shinryoucode;



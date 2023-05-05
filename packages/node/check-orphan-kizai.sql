select k.kizaicode from visit_conduct_kizai as k inner join visit_conduct as c on k.visit_conduct_id = c.id
    inner join visit as v on c.visit_id = v.visit_id 
    left outer join tokuteikizai_master_arch as m on k.kizaicode = m.kizaicode
    where m.valid_from <= date(v.v_datetime) 
    and (m.valid_upto = '0000-00-00' or date(v.v_datetime) <= m.valid_upto)
    and m.kizaicode is null
    group by k.kizaicode;



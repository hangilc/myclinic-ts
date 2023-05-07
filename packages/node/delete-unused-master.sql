delete m
from
    iyakuhin_master_arch as m
where
    m.iyakuhincode not in (
        select
            d.d_iyakuhincode
        from
            visit_drug as d
        group by
            d.d_iyakuhincode
    )
    and m.iyakuhincode not in (
        select
            c.iyakuhincode
        from
            visit_conduct_drug as c
        group by
            c.iyakuhincode
    );

delete m
from
    shinryoukoui_master_arch as m
where
    m.shinryoucode not in (
        select
            shinryoucode
        from
            visit_shinryou
        group by
            shinryoucode
    )
    and m.shinryoucode not in (
        select
            shinryoucode
        from
            visit_conduct_shinryou
        group by
            shinryoucode
    );

delete m
from
    tokuteikizai_master_arch as m
where
    m.kizaicode not in (
        select
            kizaicode
        from
            visit_conduct_kizai
        group by
            kizaicode
    );
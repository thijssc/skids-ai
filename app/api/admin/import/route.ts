import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const PROJECTS = [
  { project_number: 'DYA8001', vessel_name: 'Damen SX90 #1', yard: 'Damen', source_skid_url: 'https://seable.sharepoint.com/sites/ts-DYA8001/Project%20Files/01.%20Spa/1.%20Eng/Skids/G.%20Assembly%20files%20(Workshop)/2D%20assembly%20files/DYA8001_06_SEB_PRE_MD%20PL_filter%20skid%20rev%20f.pdf', source_pid_url: 'https://seable.sharepoint.com/sites/ts-DYA8001/Project%20Files/01.%20Spa/1.%20Eng/A.%20P%26ID/230811_DYA8001.100_MD%20Pool_P%26ID_REV-I.pdf', source_step_url: null },
  { project_number: 'DYA8002', vessel_name: 'Damen SX90 #2', yard: 'Damen', source_skid_url: 'https://seable.sharepoint.com/sites/ts-DYA8002/Project%20Files/01.%20Engineering/01.%20Spa/B.%20Drawings%20Spa/DYA8002_LP_ENG_MD%20PL_%20filter%20skid_REV-B.pdf', source_pid_url: 'https://seable.sharepoint.com/sites/ts-DYA8002/Project%20Files/01.%20Engineering/01.%20Spa/A.%20P%26ID/DYA8002.100%20-%20Pool_P%26ID.pdf', source_step_url: null },
  { project_number: 'DYA8003', vessel_name: 'Damen SX90 #3', yard: 'Damen', source_skid_url: 'https://seable.sharepoint.com/sites/ts-DYA8003/Project%20Files/01.%20Spa/A.%20Engineering/D.%20Drawings%20Spa/MD%20pool%20skid/F.%20Assembly%20files%20(Workshop)/2D%20assembly%20files/DYA8003_LP_ENG_MD%20PL_pump%20skid_REV-A.pdf', source_pid_url: 'https://seable.sharepoint.com/sites/ts-DYA8003/Project%20Files/01.%20Spa/A.%20Engineering/A.%20P%26ID/260501_DYA8003.100_MD%20Pool_P%26ID_REV-B.pdf', source_step_url: null },
  { project_number: 'DYA8004', vessel_name: 'Damen SX90 #4', yard: 'Damen', source_skid_url: null, source_pid_url: null, source_step_url: null },
  { project_number: 'DYA8005', vessel_name: 'Damen SX90 #5', yard: 'Damen', source_skid_url: 'https://seable.sharepoint.com/sites/ts-DYA8005/Project%20Files/01.%20Spa/1.%20Eng/Skids/G.%20Assembly%20files%20(Workshop)/2D%20assembly%20files/240812_DYA8005_LP_ENG_MD%20PL_%20filter%20skid_REV-A.pdf', source_pid_url: 'https://seable.sharepoint.com/sites/ts-DYA8005/Project%20Files/01.%20Spa/1.%20Eng/Skids/G.%20Assembly%20files%20(Workshop)/2D%20assembly%20files/240502_DYA8005.100_MD%20Pool_P%26ID_REV-A_Approved.pdf', source_step_url: 'https://seable.sharepoint.com/sites/ts-DYA8005/Project%20Files/01.%20Spa/1.%20Eng/Skids/F.%20Production/240808_DYA8005_LP_PRO_MD%20PL_Filter%20Skid.zip' },
  { project_number: 'DYA8006', vessel_name: 'Damen SX90 #6', yard: 'Damen', source_skid_url: 'https://seable.sharepoint.com/sites/ts-DYA8006/Project%20Files/01.%20Spa/1.%20Eng/B.%20Spa/Skids/G.%20Assembly%20files%20(Workshop)/2D%20assembly%20files/250722_DYA8006_LP_ENG_MD%20PL_%20filter%20skid_REV-A.PDF', source_pid_url: null, source_step_url: null },
  { project_number: 'OC00709', vessel_name: 'MY Draak (Oceanco)', yard: 'Oceanco', source_skid_url: null, source_pid_url: 'https://seable.sharepoint.com/sites/ts-OC00709/Project%20Files/01.%20Spa/1.%20Eng/C.%20Flowschema/00.OLD/251126_OC00709%20_UD_SP%20P%26ID%20REV-C.pdf', source_step_url: null },
  { project_number: 'OC00719', vessel_name: 'Oceanco Y719', yard: 'Oceanco', source_skid_url: null, source_pid_url: 'https://seable.sharepoint.com/sites/ts-369/Engineering/B.%20Engineering/C.%20Flowschema/OC00719-P%26ID%20POOL_MD_REV-O.pdf', source_step_url: null },
  { project_number: 'OC00722', vessel_name: 'Oceanco Y722', yard: 'Oceanco', source_skid_url: null, source_pid_url: 'https://seable.sharepoint.com/sites/ts-698/Engineering/C.%20P%26ID/01.%20Swimming%20Pool/03.%20Functional%20Description/01.%20Loose%20modes/OC00722%20SWIMMING%20POOL%20MD%20MODE%202%20FILL%20SWIMMING%20POOL%20REV-C.pdf', source_step_url: null },
  { project_number: 'OC00726', vessel_name: 'Oceanco Y726', yard: 'Oceanco', source_skid_url: 'https://seable.sharepoint.com/sites/ts-OC00726/Shared%20Documents/M.%20WORKSHOP/05.%20Skids/C.%202D%20Assembly%20files/231229_OC00726_LP_ENG_MD%20PL_392-E0001%20pool%20skid_REV-E.pdf', source_pid_url: null, source_step_url: 'https://seable.sharepoint.com/sites/ts-OC00726/Shared%20Documents/A.%20Engineering/B.%20Drawings%20S%26Co/5.%20Skids/E.%20Production%20files/231129_OC00726_LP_PRO_E0001-3-4%20skids.zip' },
  { project_number: 'OC01050', vessel_name: 'Oceanco Y1050', yard: 'Oceanco', source_skid_url: 'https://seable.sharepoint.com/sites/OC01050/Project%20Files/01.%20Spa/00-Eng/B.%20M%26D/04.2-OD_WP_Skid/02-Construction%20%26%20frame/Skidframe%20files%20Yard/Fundatie_Driptray_Skid_A.pdf', source_pid_url: null, source_step_url: null },
  { project_number: 'HE19480', vessel_name: 'Heesen YN19480', yard: 'Heesen', source_skid_url: 'https://seable.sharepoint.com/sites/ts-495/Engineering/B.%20Drawings%204SS/Pool%20skid/OLD/200525_495.Heesen%20YN19480_pool%20skid_revB.pdf', source_pid_url: null, source_step_url: null },
  { project_number: 'HE20857', vessel_name: 'Heesen 20857', yard: 'Heesen', source_skid_url: 'https://seable.sharepoint.com/sites/ts-HE20857/Project%20Files/01.%20Spa/M.%20Installation/06-2D%20files/HE20857_250228_LP_ASS_MD_PL%20-%20Skid%20REV-D.PDF', source_pid_url: null, source_step_url: null },
  { project_number: 'HE21150', vessel_name: 'Heesen 21150', yard: 'Heesen', source_skid_url: null, source_pid_url: 'https://seable.sharepoint.com/sites/ts-HE21150/Project%20Files/01.%20Spa/00-ENG/C.%20Flowschema/.110%20MD%20Pool/OLD/250902_HE21150_P%26ID_MD%20pool_REV-A.pdf', source_step_url: null },
  { project_number: 'HE21350', vessel_name: 'Heesen 21350', yard: 'Heesen', source_skid_url: null, source_pid_url: 'https://seable.sharepoint.com/sites/ts-HE0P398/Project%20Files/01.%20Spa/1.%20Eng/C.%20P%26ID/01.%20functional%20description/01.%20Loose%20modes/02_HE21350.100%20pool%20mode_fill%20pool.pdf', source_step_url: null },
  { project_number: 'HE21455', vessel_name: 'Heesen 21455', yard: 'Heesen', source_skid_url: 'https://seable.sharepoint.com/sites/ts-HE21455/Project%20Files/01.%20Spa/1.%20Eng/B.%20Spa/01%20MD%20Skid/G.%20Assembly%20files%20(Workshop)/2D%20assembly%20files/250515_HE21455_LP_ENG_SP%20MD_Skid_REV-G.PDF', source_pid_url: 'https://seable.sharepoint.com/sites/ts-HE21455/Project%20Files/01.%20Spa/1.%20Eng/C.%20Flowschema/250508_S%26CO_HE21455_P%26ID_SP-MD_REV-E.pdf', source_step_url: null },
  { project_number: 'HE21557', vessel_name: 'Heesen 21557', yard: 'Heesen', source_skid_url: 'https://seable.sharepoint.com/sites/ts-HE21557/Project%20Files/01.%20Spa/1.%20Eng/B.%20Spa/01%20MD%20Skid/D.%20Approved%20files/APP_250725%20-%20MD%20SP%20Skid%20REV-D/250707_HE21557_LP_ENG_SP%20MD_Skid_REV-D.pdf', source_pid_url: null, source_step_url: null },
  { project_number: 'HE0P462', vessel_name: 'Heesen 0P462', yard: 'Heesen', source_skid_url: null, source_pid_url: 'https://seable.sharepoint.com/sites/HE0P462/Project%20Files/01.%20Spa/1.%20Eng/C.%20Flowschema/260604_HE0P462%20MD%20%2B%20HD%20%2B%20LD%20POOL%20P%26ID%20REV-B.pdf', source_step_url: null },
  { project_number: 'VL00824', vessel_name: 'VL00824', yard: 'De Vries', source_skid_url: 'https://seable.sharepoint.com/sites/ts-VL00824/Engineering/J.%20Assembly%20workshop/Drawings%20skid/221021_03_VL00824_DVZ_ENG_RVLS_MD%20PL_circulation%20skid.PDF', source_pid_url: null, source_step_url: null },
  { project_number: 'VL00825', vessel_name: 'VL00825', yard: 'De Vries', source_skid_url: 'https://seable.sharepoint.com/sites/ts-826/Engineering/I.%20Assembly%20Workshop/MD%20Pool%20Skid/Drawings/220905_05_VL00825_DVZ_PRO_RVL_Pool_skid%20REV-F.PDF', source_pid_url: 'https://seable.sharepoint.com/sites/ts-826/Engineering/C.%20P%26ID/01.%20Functional%20discription/01.%20Swimming%20pool/VL00825.100%20FUNCTIONAL%20DISCRIPTION%20SWIMMING%20POOL%20REV-A.pdf', source_step_url: null },
  { project_number: 'VL00826', vessel_name: 'VL00826', yard: 'De Vries', source_skid_url: 'https://seable.sharepoint.com/sites/ts-VL00826/Project%20Files/00.%20Engineering/01.%20SeableSpa/D.%20Drawings%20S%26CO/Pool%20skid/G.%20Assembly%20files%20(Workshop)/2D%20assembly%20files/240415_VL00826_LP_ENG_MD%20SP_skid_REV-F.PDF', source_pid_url: null, source_step_url: null },
  { project_number: 'VL00828', vessel_name: 'VL00828', yard: 'De Vries', source_skid_url: 'https://seable.sharepoint.com/sites/ts-VL00828/Project%20Files/01.%20Spa/A.%20Engineering/B.1%20Drawings%20S%26CO/01.%20Skids/MD%20SP%20%26%20WP%20LD/F.%20Assembly%20files%20(Workshop)/2D%20assembly%20files/240503_VL00828_LP_ENG_MD%20SP%20%26%20WP%20LD_Skid_REV-F.PDF', source_pid_url: null, source_step_url: null },
  { project_number: 'VL00829', vessel_name: 'VL00829', yard: 'De Vries', source_skid_url: 'https://seable.sharepoint.com/sites/ts-VL00829/Project%20Files/01.%20Spa/1.%20Eng/B.%20Spa/MD%20Pool%20Skid/G.%20Assembly%20files%20(Workshop)/VL00829_250205_LP_ENG_MD%20PL_Skid_REV-F.PDF', source_pid_url: 'https://seable.sharepoint.com/sites/ts-VL00829/Project%20Files/01.%20Spa/1.%20Eng/C.%20P%26ID/250808_S%26CO_VL00829_P%26ID_SP-MD_WP-BD_REV-E.pdf', source_step_url: 'https://seable.sharepoint.com/sites/ts-VL00829/Project%20Files/01.%20Spa/1.%20Eng/B.%20Spa/MD%20Pool%20Skid/F.%20Production/VL00829_250219_LP_PRO_MD%20PL_Skidframe%20%2C%20881110.00402.zip' },
  { project_number: 'VL00830', vessel_name: 'MY Solent (VL00830)', yard: 'De Vries', source_skid_url: 'https://seable.sharepoint.com/sites/ts-VL00830/Project%20Files/01.%20Spa/1.%20Eng/B.%20Spa/MD%20SP%20Skid/G.%20Assembly%20files%20(Workshop)/2D%20assembly%20files/VL00830_01_NVS_ENG_RVLS_MD%20SP_SKID.pdf', source_pid_url: null, source_step_url: null },
  { project_number: 'DV00716', vessel_name: 'De Vries 00716', yard: 'De Vries', source_skid_url: 'https://seable.sharepoint.com/sites/ts-DV00716/Project%20Files/01.%20Spa/1.%20Eng/B.%20Spa/1.%20Skids/MD%20PL%20-%20OD%20WP/DV00716_240717_NVS_ENG_Pool%20skid_REV-E.pdf', source_pid_url: 'https://seable.sharepoint.com/sites/ts-DV00716/Project%20Files/00.%20Drawings%20Client/240402%20-%20E-browser%20%2B%20P%26ID%20yard/Swimming%20pool%20schematic%20RevC.pdf', source_step_url: 'https://seable.sharepoint.com/sites/ts-DV00716/Project%20Files/01.%20Spa/1.%20Eng/Skids/F.%20Production/DV00716%20Pool%20skid.zip' },
  { project_number: 'DV00722', vessel_name: 'De Vries 00722', yard: 'De Vries', source_skid_url: 'https://seable.sharepoint.com/sites/DV00722/Project%20Files/01.%20Spa/1.%20Eng/B.%20Spa/Pool/A.%20Pre-engineering/A.%203D%20files/IDR%20-%20(STEP%20RHINO)/DV00722_260512_LP_ENG_Pool%20Skid_REV-A.pdf', source_pid_url: null, source_step_url: null },
  { project_number: 'LW13797', vessel_name: 'Boardwalk (LW13797)', yard: 'De Vries', source_skid_url: 'https://seable.sharepoint.com/sites/ts-LW13797/Project%20Files/00.%20Engineering/01.%20Spa/B.%20Drawings%20S%26CO/07.%20Skids/MD%20WP_Skid%20(4590.1501)/F.%20Assembly%20files%20(Workshop)/C.%202D%20Assembly%20files/230816_LW13797_LP_ENG_WP%20skid_REV-E.pdf', source_pid_url: null, source_step_url: null },
  { project_number: 'LK13784', vessel_name: 'LK13784', yard: 'De Vries', source_skid_url: 'https://seable.sharepoint.com/sites/ts-850/Engineering/I.%20Assembly%20workshop/Skid%201306%20Pool%20Filter%20Skid/Drawings%20skid%201306/220728_03_LK13784_DVZ_ENG_LWF_MD%20PL_%20filter%20skid%201306.PDF', source_pid_url: null, source_step_url: null },
  { project_number: 'RH403', vessel_name: 'Royal Huisman 403', yard: 'Royal Huisman', source_skid_url: 'https://seable.sharepoint.com/sites/ts-514/Engineering/B.%20Drawings%204SS/Pool%20skid%20E001/production/190724_514.Royal%20Huisman%20403_POOL%20skid%20PRODUCTION_revB.pdf', source_pid_url: null, source_step_url: null },
  { project_number: 'LU13708', vessel_name: 'MY Shackleton (Lürssen)', yard: 'Lürssen', source_skid_url: 'https://seable.sharepoint.com/sites/ts-509/Shared%20Documents/B.%20Engineering/B.%20Drawings%204SS/Skids%20and%20filling%20boards/190522_509.Lurssen%2013708%20Shackleton_%20Pool%20hydro%20pumps%20skid_revB.pdf', source_pid_url: null, source_step_url: null },
  { project_number: 'NB541', vessel_name: 'Black Shark (Nobiskrug)', yard: 'Nobiskrug', source_skid_url: 'https://seable.sharepoint.com/sites/ts-541/Engineering/B.%20Drawings%204SS/01.Skid/181120_541.Nobiskrug%20Black%20Sharck%20Spa_Plunge%20Pool%20skid_revA.pdf', source_pid_url: null, source_step_url: null },
  { project_number: 'BA468', vessel_name: 'Barreras Project 468', yard: 'Barreras', source_skid_url: 'https://seable.sharepoint.com/sites/ts-468/Engineering/B.%20Drawings%204SS/01.SKIDS/190919_468.Barreras_overview%20technical%20area_complete_revG.pdf', source_pid_url: null, source_step_url: null },
  { project_number: 'RF23013', vessel_name: 'MY Albatros (Amels)', yard: 'Amels/Damen', source_skid_url: null, source_pid_url: 'https://seable.sharepoint.com/sites/ts-RF23013/Project%20Files/01.%20Spa/A.%20Engineering/B.%20P%26ID/01.%20Swimming%20pool%20MD/240715_S%26CO_RF23013_P%26ID_Swimming%20pool-REV-E.pdf', source_step_url: null },
  { project_number: 'PL25011', vessel_name: 'PL25011', yard: null, source_skid_url: null, source_pid_url: 'https://seable.sharepoint.com/sites/ts-PL25011/Project%20Files/01.%20Spa/1.%20Eng/C.%20Flowschema/250408_PL25011_S%26Co._P%26ID%20pool_REV-A.pdf', source_step_url: null },
  { project_number: 'PL23031', vessel_name: 'Villa C (PL23031)', yard: null, source_skid_url: null, source_pid_url: 'https://seable.sharepoint.com/sites/ts-PL23031/Project%20Files/01.%20Spa/B.%20Engineering/C.%20P%26ID/05.%20Swimming%20pool%20outdoor/260605_PL23031_S%26Co._P%26ID%20outdoor%20pool_REV-C.pdf', source_step_url: null },
  { project_number: 'DY00477', vessel_name: 'DY00477', yard: 'De Vries', source_skid_url: null, source_pid_url: 'https://seable.sharepoint.com/sites/ts-713/Shared%20Documents/J.%20Manual/SEND/DY00477%20-%20P%26ID%20MD%20pool%20REV-N.pdf', source_step_url: null },
  { project_number: 'OCPA683', vessel_name: 'Oceanco PA683', yard: 'Oceanco', source_skid_url: null, source_pid_url: 'https://seable.sharepoint.com/sites/ts-OCPA683/Project%20Files/00.%20Drawings%20Client/231106%20-%20GA%20%2B%20comments%20P%26ID/392%20-%20Pool%20system%20-%20Seable%20-%20MD%20Pool%20%20BrD%20AFT%20Whirlpool%20PID.pdf', source_step_url: null },
  { project_number: '618-AH14', vessel_name: 'Project 618-AH14', yard: null, source_skid_url: null, source_pid_url: 'https://seable.sharepoint.com/sites/ts-618/Engineering/01-P%26ID%20engineering/04-P%26ID/251103_618-AH14_P%26ID_OUTDOORPOOL_%20REV-A.pdf', source_step_url: null },
]

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )

  const { data: existing, error: fetchErr } = await supabase
    .from('skids')
    .select('id, project_number, source_skid_url, source_pid_url, source_step_url')

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

  const existingMap: Record<string, { id: number; source_skid_url: string | null; source_pid_url: string | null; source_step_url: string | null }> = {}
  for (const r of existing) existingMap[r.project_number] = r

  const results = { created: [] as string[], updated: [] as string[], skipped: [] as string[], errors: [] as string[] }

  for (const proj of PROJECTS) {
    const ex = existingMap[proj.project_number]

    if (ex) {
      const patch: Record<string, string> = {}
      if (proj.source_skid_url && !ex.source_skid_url) patch.source_skid_url = proj.source_skid_url
      if (proj.source_pid_url && !ex.source_pid_url) patch.source_pid_url = proj.source_pid_url
      if (proj.source_step_url && !ex.source_step_url) patch.source_step_url = proj.source_step_url

      if (Object.keys(patch).length > 0) {
        const { error } = await supabase.from('skids').update(patch).eq('id', ex.id)
        if (error) results.errors.push(`${proj.project_number}: ${error.message}`)
        else results.updated.push(`${proj.project_number} (${Object.keys(patch).join(', ')})`)
      } else {
        results.skipped.push(proj.project_number)
      }
    } else {
      const { error } = await supabase.from('skids').insert({
        project_number: proj.project_number,
        vessel_name: proj.vessel_name,
        yard: proj.yard,
        source_skid_url: proj.source_skid_url,
        source_pid_url: proj.source_pid_url,
        source_step_url: proj.source_step_url,
      })
      if (error) results.errors.push(`${proj.project_number}: ${error.message}`)
      else results.created.push(proj.project_number)
    }
  }

  return NextResponse.json({
    summary: { created: results.created.length, updated: results.updated.length, skipped: results.skipped.length, errors: results.errors.length },
    ...results
  })
}

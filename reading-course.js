/* Original instructional text and activities for Brody's Grade 7 Reading Evidence Lab. */
(() => {
 'use strict';
 const standardsSource={
  title:'California Common Core State Standards for English Language Arts, Grade 7',
  url:'https://www.cde.ca.gov/be/st/ss/documents/finalelaccssstandards.pdf'
 };
 const routine=[
  'What exactly is the claim?',
  'What was actually observed, measured, recorded, or reported?',
  'Does that evidence support the whole claim?',
  'Is the claim broader than the evidence?',
  'What additional evidence would make us more confident?'
 ];
 const rubric=[
  {id:'question',label:'Answered the actual question'},
  {id:'evidence',label:'Used relevant evidence'},
  {id:'connection',label:'Explained how the evidence supports the conclusion'},
  {id:'limits',label:'Kept the claim within what the evidence establishes'}
 ];
 const weeks=[
  {
   id:'reading7-w1',number:1,title:'Close Reading, Sequence & Context',time:'25–30 minutes',portfolio:true,
   standards:['RI.7.1','RI.7.3','RI.7.4','L.7.4'],
   skills:['close reading','sequence','transition language','vocabulary in context','multiple-meaning words'],
   lesson:[
    'A timeline is an argument about order. Do not rely on what usually happens. Track what this text says happened, and use dates, time phrases, transitions, and cause-and-effect language to prove each placement.',
    'A word can have several real definitions while only one fits a sentence. Test the nearby clues, the topic, and the logic of the paragraph. Your job is to choose the meaning the author is using, then identify the clue that rules out the tempting alternatives.'
   ],
   vocabulary:[['sequence','the order in which events or ideas occur'],['context','the words, sentences, and situation around a word'],['trajectory','the path an object follows through space'],['figure','the precise shape or form of something; it can also mean a number or person in other contexts']],
   choices:[
    {
     id:'mars-orbiter',title:'The Unit Mix-Up That Lost a Mars Spacecraft',label:'Space + engineering failure',sourceLabel:'Original course summary based on NASA/JPL records.',
     sources:[
      {title:'Mars Climate Orbiter mission overview · NASA/JPL',url:'https://www.jpl.nasa.gov/missions/mars-climate-orbiter/'},
      {title:'Mars Climate Orbiter team findings · NASA/JPL',url:'https://www.jpl.nasa.gov/news/mars-climate-orbiter-team-finds-likely-cause-of-loss/'}
     ],
     sections:[
      {heading:'Mission file: Mars Climate Orbiter',text:`NASA launched the Mars Climate Orbiter on December 11, 1998. The spacecraft was supposed to study the Martian atmosphere and relay messages for another mission. For nine months, navigation teams used radio signals and computer models to predict its course toward Mars.

The model needed small-force data from brief thruster firings. A contractor's program recorded those forces in pound-seconds, an English unit. The navigation software expected newton-seconds, a metric unit. Because the file did not use the required unit, the software underestimated how much the firings had changed the spacecraft's trajectory. The difference accumulated as the orbiter crossed millions of kilometers.

During the final approach on September 23, 1999, controllers expected the radio signal to disappear briefly when the spacecraft passed behind Mars. The signal vanished, but it never returned. Tracking evidence indicated that the orbiter had traveled much lower through the atmosphere than planned and had been destroyed.

After the loss, review teams traced the navigation error to the unit mismatch. Their report did not treat one incorrect file as the entire story. Required checks had failed to catch the mismatch, and engineers had not fully investigated earlier signs that the predicted and observed paths disagreed. The sequence matters: the review identified the cause after the loss by connecting earlier records, the changing path, and the final signal.`}
     ],
     objectives:[
      {id:'w1-mco-order',type:'order',prompt:'Put these events in the order stated in the mission file.',options:[['launch','The spacecraft launches.'],['unit','A force file supplies data in the wrong unit.'],['signal','The signal disappears and does not return.'],['review','Review teams trace the navigation error.']],correct:['launch','unit','signal','review'],rationale:'The dates and the phrases “for nine months,” “during the final approach,” and “after the loss” establish this order.'},
      {id:'w1-mco-before',type:'single',prompt:'What happened immediately before review teams investigated the loss?',options:[['a','The spacecraft launched.'],['b','The radio signal disappeared and did not return.'],['c','The contractor selected a metric unit.'],['d','The orbiter began relaying messages.']],correct:'b',rationale:'The last event before the review is the final approach and loss of signal.'},
      {id:'w1-mco-course',type:'single',prompt:'In “predict its course toward Mars,” what does course mean?',options:[['a','A class of study'],['b','A part of a meal'],['c','A path or direction of travel'],['d','A field used for racing']],correct:'c',rationale:'“Toward Mars,” navigation teams, and the later word “trajectory” point to a path of travel.'},
      {id:'w1-mco-transition',type:'single',prompt:'Which phrase most clearly shows that the cause was identified after the spacecraft was lost?',options:[['a','For nine months'],['b','Because the file did not use the required unit'],['c','During the final approach'],['d','After the loss']],correct:'d',rationale:'“After the loss” directly locates the review later in the sequence.'}
     ],
     responses:[
      {id:'w1-mco-explain',label:'Sequence proof',prompt:'Choose two placements in your sequence. For each one, identify the exact time, transition, or cause-and-effect language that proves where it belongs. Then explain why the order matters to the investigation.',rows:6}
     ]
    },
    {
     id:'hubble-mirror',title:'The Tiny Measurement Error That Blurred Hubble',label:'Space telescope mystery',sourceLabel:'Original course summary based on NASA records.',
     sources:[
      {title:"Hubble's Mirror Flaw · NASA Science",url:'https://science.nasa.gov/mission/hubble/observatory/design/optics/hubbles-mirror-flaw/'},
      {title:'Servicing Mission 1 · NASA Science',url:'https://science.nasa.gov/mission/hubble/observatory/missions-to-hubble/servicing-mission-1/'}
     ],
     sections:[
      {heading:'Mission file: A telescope that could not focus',text:`The Hubble Space Telescope launched on April 24, 1990. When engineers examined its first images, bright objects looked fuzzy. Two different cameras showed the same distortion. That clue pointed away from a single camera and toward the shared optical system.

In June, NASA announced that the telescope had spherical aberration: light striking different parts of the main mirror did not meet at one focal point. The following month, NASA formed an investigation board. The board examined construction records, interviewed workers, and tested the equipment that had measured the mirror nine years earlier.

Investigators discovered that the primary mirror had the wrong figure. In optical engineering, figure means the mirror's exact shape, not a number or a person. A lens inside a testing device had been spaced incorrectly by 1.3 millimeters. That setup falsely indicated that the mirror had the right curve, so workers polished its outer edge too flat.

Once the flaw was understood precisely, engineers could design a correction. In December 1993, astronauts installed new instruments with corrective optics. These did not reshape the main mirror. Instead, they redirected the incoming light, much as eyeglasses compensate for the shape of an eye. Images made after the repair showed that the strategy worked.`}
     ],
     objectives:[
      {id:'w1-hub-order',type:'order',prompt:'Put these events in the order stated in the mission file.',options:[['launch','Hubble launches.'],['blur','Engineers notice fuzzy images.'],['board','An investigation board tests records and equipment.'],['repair','Astronauts install corrective optics.']],correct:['launch','blur','board','repair'],rationale:'The text moves from April 1990, to June and July, and then to December 1993.'},
      {id:'w1-hub-between',type:'single',prompt:'What happened between NASA announcing the flaw and astronauts installing the correction?',options:[['a','The telescope was launched.'],['b','Investigators found how the mirror had been measured incorrectly.'],['c','Both cameras stopped taking images.'],['d','Workers reshaped the main mirror in orbit.']],correct:'b',rationale:'The investigation identified the mirror and test-device error before engineers could design the correction.'},
      {id:'w1-hub-figure',type:'single',prompt:'What does figure mean in “the primary mirror had the wrong figure”?',options:[['a','Its exact optical shape'],['b','A famous person'],['c','A number in a table'],['d','A drawing in a report']],correct:'a',rationale:'The following sentences discuss curve, spacing, polishing, and an edge that was too flat.'},
      {id:'w1-hub-clue',type:'single',prompt:'Which detail first suggested that the problem was shared by the telescope rather than limited to one camera?',options:[['a','Hubble launched in April.'],['b','Bright objects exist in space.'],['c','Two different cameras showed the same distortion.'],['d','Astronauts made a repair in 1993.']],correct:'c',rationale:'The same effect in two cameras directs attention to a system both cameras share.'}
     ],
     responses:[
      {id:'w1-hub-explain',label:'Sequence proof',prompt:'Choose two placements in your sequence. Identify the exact time, transition, or cause-and-effect language that proves each placement. Then explain why investigators had to understand the flaw before engineers could design a correction.',rows:6}
     ]
    }
   ]
  },
  {
   id:'reading7-w2',number:2,title:'Dialogue, Character & Author Choices',time:'25–30 minutes',portfolio:true,
   standards:['RL.7.1','RL.7.3','RL.7.5'],
   skills:['dialogue analysis','character response','author choices','cause and effect','text evidence'],
   lesson:[
    'Dialogue matters when it changes the pressure in a scene. Trace a line forward: what does the character think next, what decision follows, what action changes, and what later event results?',
    'A line can sound dramatic without driving the plot. Strong analysis connects the author’s exact words to a later choice and supports that connection with more than one detail.'
   ],
   vocabulary:[['pivotal','important because it changes what happens next'],['intercept','to stop or catch something before it reaches its destination'],['archive','a collection preserved so it can be studied later'],['reconstruct','to build or form again from available evidence']],
   choices:[
    {
     id:'orbital-blackout',title:'Blackout on Deck Nine',label:'Original space-station fiction',sourceLabel:'Original fiction written for this course.',sources:[],
     sections:[{heading:'Blackout on Deck Nine',text:`The station museum went dark twelve minutes before the visiting shuttle was due to dock. Emergency strips glowed along the floor, but the blue arrows led away from the docking gallery.

Ilan lifted the maintenance map on his tablet. “The arrows say the pressure doors are north of us. We should move.”

Mei kept her hand on the wall. She had helped install the new exhibit cases last month, and the corridor felt wrong. A faint vibration pulsed beneath her fingers. “If the map is wrong, following it faster only gets us lost.”

“The map passed inspection,” Ilan said.

“Before the cases were moved.” Mei aimed her light at the floor. The emergency strips disappeared beneath a display platform and emerged on its other side, where one arrow pointed into a locked storage room. The platform had been rotated during installation. No one had updated the route.

Ilan glanced at the countdown on his wrist screen: nine minutes. “Then what do we trust?”

Mei listened to the vibration. Docking clamps were cycling somewhere beyond the wall. She opened the station’s live pressure diagram instead of the museum map. Two doors on the diagram changed from green to amber as the shuttle approached. The nearest one was behind the new meteorite case.

They rolled the case aside and found the door controls. Mei restored power to the guidance lights with four minutes left. Later, when the museum director praised her memory of the corridor, Mei corrected him. She had not remembered the route. She had decided which evidence was current.`}],
     objectives:[
      {id:'w2-orbit-line',type:'single',prompt:'Which line of dialogue is the turning point in Mei’s approach?',options:[['a','“The map passed inspection.”'],['b','“If the map is wrong, following it faster only gets us lost.”'],['c','“Then what do we trust?”'],['d','“We should move.”']],correct:'b',rationale:'That line rejects speed without verification and sets up Mei’s decision to test the map against current evidence.'},
      {id:'w2-orbit-effect',type:'single',prompt:'What does Mei decide because of the exchange about the map?',options:[['a','Wait for the director to arrive'],['b','Follow the arrows more quickly'],['c','Compare physical clues and live system data with the old map'],['d','Cancel the shuttle visit']],correct:'c',rationale:'She studies the displaced strips, vibration, and live pressure diagram instead of treating the inspected map as final.'},
      {id:'w2-orbit-evidence',type:'multi',prompt:'Select the TWO details that best show the dialogue changes what Mei does next.',selectionCount:2,options:[['a','The shuttle is visiting the station.'],['b','She traces where the emergency strips disappear under the platform.'],['c','Ilan wears a wrist screen.'],['d','She opens the live pressure diagram instead of relying on the museum map.'],['e','The museum contains a meteorite case.']],correct:['b','d'],rationale:'Both actions test the line’s warning that an old map may be wrong. The other details are setting or background.'}
     ],
     responses:[{id:'w2-orbit-analysis',label:'Dialogue effect analysis',prompt:'Trace the chain: pivotal dialogue → change in Mei’s thinking → decision or action → later event. Use at least two details from the story and explain why the author placed the line before Mei studies the physical clues.',rows:7}]
    },
    {
     id:'audio-archive',title:'The Last Song in the Archive',label:'Original music mystery fiction',sourceLabel:'Original fiction written for this course.',sources:[],
     sections:[{heading:'The Last Song in the Archive',text:`Nico had spent three afternoons cleaning the hiss from a 1932 wax-cylinder recording. Beneath the crackle, a singer held one impossible note. The restoration program labeled it eleven seconds long—longer than the breaths in any other song from the collection.

“We found her masterpiece,” Nico said. He moved the cursor toward Publish.

Archivist Sora leaned closer. “A cleaner signal can still be a false one.”

Nico stopped. The software had filled several gaps automatically, but its green display made the repair look certain. “You think the singer didn’t hold the note?”

“I think we should ask what the original surface actually recorded.”

They played the unfiltered cylinder at half speed. A soft click repeated every revolution. Nico marked each click on the waveform. The impossible note matched the same short phrase copied four times. A scratch had caused the needle to jump backward, and the restoration program had blended the repetitions into one smooth sound.

Nico canceled the upload. He saved two versions instead: the untouched recording and a restoration with every repair listed. At the exhibit opening, visitors could switch between them. The repeated phrase sounded less magical than the eleven-second note, but the display revealed something better—how a convincing mistake had been discovered.`}],
     objectives:[
      {id:'w2-audio-line',type:'single',prompt:'Which line most directly changes Nico’s decision?',options:[['a','“We found her masterpiece.”'],['b','“You think the singer didn’t hold the note?”'],['c','“A cleaner signal can still be a false one.”'],['d','“I think we should ask what the original surface actually recorded.”']],correct:'c',rationale:'Sora’s warning interrupts the publication and changes Nico from accepting the cleaned result to testing it.'},
      {id:'w2-audio-effect',type:'single',prompt:'What decision follows from Sora’s warning?',options:[['a','Nico publishes immediately.'],['b','They compare the cleaned result with the original cylinder.'],['c','They ask the singer to record the song again.'],['d','Nico deletes both versions.']],correct:'b',rationale:'The characters slow and play the unfiltered source, which exposes the repeated click and copied phrase.'},
      {id:'w2-audio-evidence',type:'multi',prompt:'Select the TWO details that best show the warning affects later events.',selectionCount:2,options:[['a','The cylinder was recorded in 1932.'],['b','Nico stops before selecting Publish.'],['c','The exhibit has visitors.'],['d','They play the unfiltered cylinder and mark the repeated clicks.'],['e','The singer appears in other songs.']],correct:['b','d'],rationale:'Stopping publication and checking the source are direct consequences of the warning.'}
     ],
     responses:[{id:'w2-audio-analysis',label:'Dialogue effect analysis',prompt:'Trace the chain: pivotal dialogue → change in Nico’s thinking → decision or action → later event. Use at least two details from the story and explain why the author places Sora’s warning just before the investigation.',rows:7}]
    }
   ]
  },
  {
   id:'reading7-w3',number:3,title:'Claims & Evidence',time:'25–30 minutes',portfolio:true,
   standards:['RI.7.1','RI.7.8','SL.7.3'],
   skills:['distinguishing claims from evidence','evaluating support','absolute language','explaining a verdict'],
   lesson:[
    'A claim says what someone wants you to believe. Evidence is the observation, measurement, record, or report offered in support. They are not interchangeable.',
    'Use three verdicts: COMPLETELY when the evidence supports the whole claim, PARTLY when it supports a narrower version, and NOT AT ALL when the evidence does not connect. Watch for all, every, always, only, never, and proves.'
   ],
   vocabulary:[['claim','a statement someone presents as true'],['evidence','information used to support or challenge a claim'],['verdict','a reasoned decision about how well the evidence supports the claim'],['absolute language','words that leave no exceptions, such as always or every']],
   choices:[{
    id:'claim-lab',title:'The Claim Lab',label:'Four real-world-style cases',sourceLabel:'Original practice scenarios; all data are fictional.',sources:[],
    sections:[
     {heading:'Case A · The overnight battery',text:'Observed: After one software update, three phones of the same model lost 11%, 14%, and 13% charge overnight. They were on the same Wi-Fi network. Claim posted online: “This update drains every kind of phone battery overnight.”'},
     {heading:'Case B · The harbor coin',text:'Recorded: Archaeologists documented one foreign coin in a sealed layer near an ancient harbor. The layer dates to the period when ships visited from several regions. Claim in a tour video: “This proves everyone in the entire kingdom used foreign coins every day.”'},
     {heading:'Case C · Music and puzzles',text:'Measured: Forty volunteers solved one puzzle set in silence and another while instrumental music played. The music round averaged two more correct answers. Everyone did the silent round first. Claim in a headline: “Instrumental music makes every person smarter.”'},
     {heading:'Case D · The laundry portal',text:'Observed: One striped sock went into the washing machine. After the load, no one found it in the drum, hamper, sleeves, or laundry-room floor. Claim from a highly confident sibling: “The washing machine is definitely an interdimensional portal that eats only left socks.”'},
     {heading:'Case E · The bridge test',text:'Measured: Under the same test setup, model bridge A bent when the load reached 3.8 kilograms; model bridge B bent at 5.4 kilograms. Claim in the lab note: “In this test, bridge B carried more mass before bending than bridge A.”'}
    ],
    objectives:[
     {id:'w3-battery',type:'single',prompt:'Case A verdict: How far does the evidence support the posted claim?',options:[['complete','Completely'],['partly','Partly'],['none','Not at all']],correct:'partly',rationale:'The data support a possible battery change for three phones of one model under one set of conditions, not every kind of phone.'},
     {id:'w3-coin',type:'single',prompt:'Case B verdict: How far does the coin support the tour-video claim?',options:[['complete','Completely'],['partly','Partly'],['none','Not at all']],correct:'partly',rationale:'The coin supports contact or presence at this harbor and time. It cannot establish daily use by everyone across a kingdom.'},
     {id:'w3-music',type:'single',prompt:'Case C verdict: How far does the study support the headline?',options:[['complete','Completely'],['partly','Partly'],['none','Not at all']],correct:'partly',rationale:'The average changed in this group, but order effects and individual results are unknown. “Every person” and “smarter” go beyond the measurement.'},
     {id:'w3-sock',type:'single',prompt:'Case D verdict: How far does the missing sock support the portal claim?',options:[['complete','Completely'],['partly','Partly'],['none','Not at all']],correct:'none',rationale:'A missing sock does not connect to an interdimensional portal, and many ordinary explanations remain.'},
     {id:'w3-bridge',type:'single',prompt:'Case E verdict: How far do the measurements support the limited lab-note claim?',options:[['complete','Completely'],['partly','Partly'],['none','Not at all']],correct:'complete',rationale:'The claim stays inside this test and compares exactly the measured loads at which the two bridges bent.'},
     {id:'w3-absolute',type:'multi',prompt:'Select every phrase that makes one of the claims broader or more certain than its evidence.',options:[['a','three phones of the same model'],['b','every kind of phone'],['c','one foreign coin'],['d','everyone in the entire kingdom'],['e','every person'],['f','definitely an interdimensional portal']],correct:['b','d','e','f'],rationale:'These phrases make universal or certain claims. The other phrases describe limits in the actual evidence.'}
    ],
    responses:[{id:'w3-audit',label:'One complete claim audit',prompt:'Choose Case A, B, or C. Write the exact CLAIM, the actual EVIDENCE, your VERDICT, and WHY. End with one piece of additional evidence that would make the conclusion stronger or weaker.',rows:8}]
   }]
  },
  {
   id:'reading7-w4',number:4,title:'Strongest Evidence',time:'25–35 minutes',portfolio:true,
   standards:['RL.7.1','RI.7.1','RI.7.8'],
   skills:['selecting multiple evidence pieces','ranking relevance','rejecting tempting weak details','constructed response'],
   lesson:[
    'A detail can be true and related without proving the point. The strongest evidence connects directly to the exact claim and works with another detail to rule out competing explanations.',
    'When a question asks for two pieces, test them as a pair. Do they establish different links in the reasoning, or do they merely repeat background information?'
   ],
   vocabulary:[['relevant','directly connected to the question or claim'],['probative','useful for proving or testing a point'],['control trial','a comparison test in which the suspected factor is absent'],['provenance','the recorded origin and history of an object']],
   choices:[
    {
     id:'rover-wheels',title:'Why Did the Rover Wheels Tear?',label:'Original engineering investigation',sourceLabel:'Original fictional engineering scenario.',sources:[],
     sections:[{heading:'Field report',text:`A prototype rover completed two test routes using the same load and wheel settings. On the first route, cameras recorded the front wheels pressing against clusters of thin, sharp rocks. After 12 kilometers, inspectors found three new punctures beside matching scrape marks. On the second route, the rover traveled 12 kilometers over smooth sand. Inspectors found no new punctures.

The team also recorded a rise in wheel temperature on both routes. Mars photographs show sharp rocks in several regions. The prototype is painted blue, and one engineer had already requested thicker wheels before either test. The lead investigator made this claim: repeated contact with sharp rocks contributed to the new punctures during the first route.`}],
     objectives:[
      {id:'w4-rover-strong',type:'multi',selectionCount:2,prompt:'Select the TWO strongest pieces of evidence for the investigator’s claim.',options:[['a','Cameras recorded the wheels pressing against sharp rocks, and punctures appeared beside matching scrape marks.'],['b','Mars photographs show sharp rocks in several regions.'],['c','The blue rover traveled 12 kilometers.'],['d','The same rover had no new punctures after an equal-distance smooth-sand route.'],['e','One engineer had requested thicker wheels.'],['f','Wheel temperature rose on both routes.']],correct:['a','d'],rationale:'A connects contact to matching damage; D supplies a comparison without sharp-rock contact. Together they test the claim more directly than background, opinion, or a change seen in both routes.'},
      {id:'w4-rover-reject',type:'single',prompt:'Which detail is most tempting but still weak for proving what punctured these particular wheels?',options:[['a','The rover is blue.'],['b','Mars photographs show sharp rocks in several regions.'],['c','The smooth-sand route caused no new punctures.'],['d','Scrape marks matched the places of contact.']],correct:'b',rationale:'Sharp rocks elsewhere make the idea plausible, but they do not show what contacted and damaged this rover during this test.'}
     ],
     responses:[
      {id:'w4-rover-compare',label:'Why these two?',prompt:'Explain why your two selected details are stronger than the tempting weak detail. Name the exact link each strong detail adds.',rows:5},
      {id:'w4-rover-find',label:'Find the evidence yourself',prompt:'New claim: the wheel-temperature rise does not, by itself, explain the punctures. Find two details in the report that support this claim and explain the connection.',rows:5}
     ]
    },
    {
     id:'sealed-door',title:'Was the Stone Door Sealed on Purpose?',label:'Original archaeology investigation',sourceLabel:'Original fictional archaeology scenario.',sources:[],
     sections:[{heading:'Excavation note',text:`A survey team found a stone doorway hidden behind a later plaster wall. The doorway itself was packed with blocks. Mortar between those blocks matched the mineral mixture in the building’s oldest walls, and two blocks continued a carved construction mark that began on the original doorframe. Dust samples from the sealed space contained no modern fibers.

A story written six centuries later describes a ruler hiding treasure in a “door without a room.” Tour guides repeat that story, although the text never names this building. A bronze cup was found nearby, but it came from loose soil disturbed during road construction. The lead archaeologist made this claim: builders intentionally blocked the doorway during the building’s early use.`}],
     objectives:[
      {id:'w4-door-strong',type:'multi',selectionCount:2,prompt:'Select the TWO strongest pieces of evidence for the archaeologist’s claim.',options:[['a','The mortar matches material in the building’s oldest walls.'],['b','A later story mentions a door without a room.'],['c','A bronze cup was found in disturbed soil nearby.'],['d','Construction marks continue from the original frame across two blocking stones.'],['e','Tour guides repeat the treasure story.'],['f','The doorway is made of stone.']],correct:['a','d'],rationale:'The matching material connects the blockage to the early building phase; the continuous marks connect the blocks to deliberate construction at the doorway.'},
      {id:'w4-door-reject',type:'single',prompt:'Which detail is tempting because it sounds dramatic but has weak provenance for this claim?',options:[['a','The mortar mixture matches.'],['b','The construction marks continue.'],['c','The bronze cup came from disturbed soil nearby.'],['d','The blocks fill the doorway.']],correct:'c',rationale:'Because the soil was disturbed, the cup’s original location and relationship to the doorway are unknown.'}
     ],
     responses:[
      {id:'w4-door-compare',label:'Why these two?',prompt:'Explain why your two selected details are stronger than the tempting weak detail. Name the exact link each strong detail adds.',rows:5},
      {id:'w4-door-find',label:'Find the evidence yourself',prompt:'New claim: the later treasure story cannot identify why this specific doorway was blocked. Find two details that limit the story’s usefulness and explain the connection.',rows:5}
     ]
    }
   ]
  },
  {
   id:'reading7-w5',number:5,title:'How Far Can the Evidence Go?',time:'25–30 minutes',portfolio:true,
   standards:['RI.7.1','RI.7.8','L.7.6'],
   skills:['overgeneralization','qualified claims','limits of evidence','correlation and causation','precise wording'],
   lesson:[
    'Evidence has borders: sample, place, time, method, and conditions. A trustworthy conclusion stays inside those borders. A dramatic conclusion often jumps beyond them.',
    'Qualification is precision, not weakness. Phrases such as “in these trials,” “among the people surveyed,” and “the evidence suggests” tell readers exactly how far a conclusion can travel.'
   ],
   vocabulary:[['sample','the smaller group or set actually studied'],['variable','a factor that can change'],['correlation','two things changing together without, by itself, proving that one caused the other'],['qualify','to limit a statement so it matches the evidence']],
   choices:[
    {
     id:'laptop-cooling',title:'Can a Stand Cool a Gaming Laptop?',label:'Original experiment data',sourceLabel:'Fictional practice data created for this course.',sources:[],
     sections:[{heading:'Test conditions',text:'A tester used one laptop, the same game scene, the same graphics settings, and the same 22°C room. The tester ran three 20-minute trials with the laptop flat on a desk and three with it raised on an open stand. Maximum processor temperatures are shown below. Fan speed was controlled automatically by the laptop.'}],
     table:{caption:'Maximum processor temperature',headers:['Setup','Trial 1','Trial 2','Trial 3','Average'],rows:[['Flat on desk','89°C','91°C','88°C','89.3°C'],['Raised on stand','81°C','83°C','80°C','81.3°C']]},
     objectives:[
      {id:'w5-laptop-conclusion',type:'single',prompt:'Which conclusion best matches the evidence?',options:[['a','Laptop stands always prevent overheating in every computer.'],['b','The stand proved that blocked vents are the only cause of heat.'],['c','In these six trials, this laptop reached lower maximum temperatures when raised on the stand.'],['d','Any raised laptop will be exactly 8°C cooler.']],correct:'c',rationale:'It states the observed pattern and keeps the claim within this laptop, these trials, and these conditions.'},
      {id:'w5-laptop-limit',type:'multi',prompt:'Which TWO limits matter before applying the result to all laptops?',selectionCount:2,options:[['a','Only one laptop model was tested.'],['b','The room was 22°C.'],['c','The table uses rows and columns.'],['d','Only six short trials were run.'],['e','The temperatures include digits.']],correct:['a','d'],rationale:'One device and six short trials are narrow evidence. More models and repeated conditions would test generalization.'},
      {id:'w5-laptop-cause',type:'single',prompt:'Does this test prove the stand will prevent every kind of overheating?',options:[['yes','Yes, because the averages differ.'],['no','No; it tests one setup and one temperature outcome under limited conditions.']],correct:'no',rationale:'The comparison is useful, but it does not cover every device, heat source, workload, room, or failure mode.'}
     ],
     responses:[{id:'w5-laptop-rewrite',label:'Rewrite the claim',prompt:'Rewrite “A stand proves every laptop will stay safe from overheating” so it accurately reflects the sample, conditions, and result. Then name one result that would weaken your revised claim.',rows:6}]
    },
    {
     id:'night-music',title:'Does Instrumental Music Improve Maze Scores?',label:'Original limited study',sourceLabel:'Fictional practice data created for this course.',sources:[],
     sections:[{heading:'Study conditions',text:'Twelve volunteers from one after-school robotics club completed two digital mazes of similar difficulty. Six did Maze A in silence and Maze B with instrumental music; the other six used the reverse order. The table reports the number who finished within four minutes. Volunteers chose the music volume. No one tested lyrics, other age groups, or long work sessions.'}],
     table:{caption:'Volunteers finishing within four minutes',headers:['Condition','Finished','Did not finish','Total'],rows:[['Silence','7','5','12'],['Instrumental music','9','3','12']]},
     objectives:[
      {id:'w5-music-conclusion',type:'single',prompt:'Which conclusion best matches the evidence?',options:[['a','Instrumental music makes all students solve every problem faster.'],['b','In this small robotics-club sample, more volunteers met the four-minute target with instrumental music than in silence.'],['c','The study proves lyrics damage concentration.'],['d','Music caused exactly two people to become smarter.']],correct:'b',rationale:'It reports what happened in this sample without turning one task into a universal causal claim.'},
      {id:'w5-music-limit',type:'multi',selectionCount:2,prompt:'Which TWO missing groups or conditions most limit a broad schoolwide claim?',options:[['a','Students outside this one club'],['b','Longer and different kinds of work'],['c','The names of the two mazes'],['d','The color of the headphones'],['e','Whether the table has grid lines']],correct:['a','b'],rationale:'A broader student sample and varied work conditions would be directly relevant to a schoolwide concentration claim.'},
      {id:'w5-music-cause',type:'single',prompt:'What is the safest interpretation of the difference?',options:[['a','The pattern suggests a possible benefit under these conditions; more evidence is needed for a causal generalization.'],['b','The music proves every volunteer improved.'],['c','Silence never helps anyone.'],['d','The result proves instrumental music is the only variable that matters.']],correct:'a',rationale:'The design offers a useful comparison, but the small specialized sample and limited task restrict the claim.'}
     ],
     responses:[{id:'w5-music-rewrite',label:'Rewrite the claim',prompt:'Rewrite “Instrumental music always makes students think faster” so it matches the sample and measurement. Then name one result that would weaken your revised claim.',rows:6}]
    }
   ]
  },
  {
   id:'reading7-w6',number:6,title:'What Evidence Are We Missing?',time:'25–30 minutes',portfolio:true,
   standards:['RI.7.1','RI.7.8','SL.7.3'],
   skills:['identifying needed evidence','evaluating investigations','relevance','strengthening and weakening claims'],
   lesson:[
    '“We need more data” is incomplete. Name the missing link. Would the new information compare conditions, verify a date, rule out an alternative, or test whether a result repeats?',
    'A huge pile of irrelevant facts is weaker than one well-designed observation. Choose evidence because it can change confidence in the exact claim.'
   ],
   vocabulary:[['relevant evidence','information that can raise or lower confidence in the exact claim'],['replicate','to repeat a test to see whether the result occurs again'],['provenance','evidence about where an artifact came from and how it reached its recorded location'],['confounding factor','another difference that could explain an observed result']],
   choices:[{
    id:'missing-evidence-lab',title:'Three Unfinished Investigations',label:'Engineering + history + everyday reasoning',sourceLabel:'Original fictional scenarios.',sources:[],
    sections:[
     {heading:'Mystery 1 · The cold-weather drone',text:'A delivery drone flew normally in the afternoon. The next morning, at 4°C, its battery warning appeared after six minutes and the drone returned early. Claim: “This battery model becomes unreliable below 10°C.” The battery began the morning flight at 72% charge; the afternoon flight began at 100%.'},
     {heading:'Mystery 2 · The blue glass bead',text:'A blue glass bead was found at an inland settlement. Its excavation layer may date to 200–300 CE. Claim: “The settlement traded directly with Egyptian merchants.” The bead has not been chemically analyzed, and several neighboring ports exchanged similar objects through middle traders.'},
     {heading:'Mystery 3 · The always-faster road',text:'On Tuesday at 10:15 a.m., the River Road trip took 12 minutes less than the highway trip made the previous day at 8:05 a.m. Claim: “River Road is always the faster route.” The trips used the same start and destination but different drivers and traffic periods.'}
    ],
    objectives:[
     {id:'w6-drone',type:'single',prompt:'Which investigation would best test the temperature part of the drone claim?',options:[['a','Count every drone in the company logo.'],['b','Run repeated flights with the same drone, charge, load, route, and wind while varying temperature.'],['c','Survey pilots about their favorite weather.'],['d','Measure one different battery indoors.']],correct:'b',rationale:'It controls competing factors and repeats the comparison while changing the claimed cause: temperature.'},
     {id:'w6-bead',type:'single',prompt:'Which evidence would most directly test whether the bead came through direct Egyptian trade?',options:[['a','Chemical composition, secure dating, production-source comparison, and records of possible trade routes'],['b','A list of every blue object in modern museums'],['c','The number of houses at the site'],['d','A larger photograph of the same bead']],correct:'a',rationale:'Origin, date, and route evidence address the claimed direct connection and competing middle-trader explanation.'},
     {id:'w6-road',type:'single',prompt:'Which evidence would best test the word always in the road claim?',options:[['a','One more River Road trip at 10:15 a.m.'],['b','Repeated paired trips on both routes at matched times and days, with travel times and unusual delays recorded'],['c','The total length of every road in the state'],['d','Driver opinions about scenery']],correct:'b',rationale:'Matched repeated comparisons directly test consistency across the times and conditions implied by “always.”'},
     {id:'w6-irrelevant',type:'single',prompt:'Which example shows that MORE information can still be weak because it is irrelevant?',options:[['a','Testing a battery at several controlled temperatures'],['b','Analyzing a bead’s composition and dated layer'],['c','Collecting the length of every state road to decide which of two local routes is faster'],['d','Recording paired travel times']],correct:'c',rationale:'That large dataset does not compare the two routes or the conditions in the claim.'}
    ],
    responses:[{id:'w6-plan',label:'Build one missing-evidence plan',prompt:'Choose one mystery. State the missing link, propose one specific observation or investigation, and explain how each possible result would strengthen OR weaken the claim. Identify one confounding factor your plan controls.',rows:8}]
   }]
  },
  {
   id:'reading7-w7',number:7,title:'Reading Investigation',time:'30–35 minutes',portfolio:true,
   standards:['RI.7.1','RI.7.7','RI.7.8','RI.7.9','W.7.9'],
   skills:['source comparison','claim analysis','strongest evidence','limits and overreach','missing evidence','evidence-based conclusion'],
   lesson:[
    'An investigation does not reward the longest answer. It rewards a precise question, accurate source summaries, strong evidence, fair limits, and a conclusion whose confidence matches the record.',
    'Treat each source as a tool with a job. Ask what it directly establishes, what it only suggests, and what it cannot tell you. Then combine the sources without making either one say more than it does.'
   ],
   vocabulary:[['establish','to show with dependable evidence'],['hypothesis','a proposed explanation that can be tested'],['overreach','a conclusion that travels beyond the available evidence'],['confidence','how strongly the evidence supports a conclusion']],
   choices:[
    {
     id:'sailing-stones',title:'What Moved Death Valley’s “Sailing Stones”?',label:'Earth-science mystery',sourceLabel:'Two original summaries of the linked sources.',
     sources:[
      {title:'The Racetrack · Death Valley National Park, NPS',url:'https://www.nps.gov/deva/planyourvisit/the-racetrack.htm/index.htm'},
      {title:'Norris et al. (2014), first observation of rocks in motion · PLOS ONE/PubMed',url:'https://pubmed.ncbi.nlm.nih.gov/25162535/'}
     ],
     sections:[
      {heading:'Source 1 · National Park Service field overview',text:`Racetrack Playa is a dry lakebed marked by long trails behind stones. The trails are physical records that the stones moved, sometimes in paths that run alongside one another. For years, observers proposed explanations involving wind, water, mud, and ice. The park overview describes the phenomenon and the difficult conditions at the remote playa. Trails can show direction and distance, but a trail alone does not record the exact moment or mechanism of motion.`},
      {heading:'Source 2 · 2014 monitored observation',text:`Researchers placed GPS instruments in selected rocks and operated a weather station. In December 2013 they directly observed more than 60 rocks move while a shallow pond covered part of the playa. Overnight cold had formed thin floating ice. As morning sunlight broke the ice into large panels, light wind drove the panels against rocks. The rocks moved slowly across wet mud and left fresh trails. The observation linked synchronized motion with water, thin ice, sunlight, and wind. The study documented this mechanism during observed events; it did not watch the formation of every older trail on the playa.`}
     ],
     objectives:[
      {id:'w7-stones-source',type:'single',prompt:'What does Source 1 establish most directly?',options:[['a','Every trail formed from exactly the same mechanism.'],['b','The stones left movement trails and several explanations had been proposed.'],['c','Thin ice was measured during every historical event.'],['d','Humans moved all the stones.']],correct:'b',rationale:'The field overview documents the phenomenon and its visible record, while leaving the mechanism open.'},
      {id:'w7-stones-strong',type:'single',prompt:'Which is the strongest evidence for the ice-panel mechanism during the monitored event?',options:[['a','The playa is remote.'],['b','Some stones are large.'],['c','Researchers directly observed GPS-tracked rocks move as thin ice panels were driven by wind.'],['d','People had proposed many theories.']],correct:'c',rationale:'It connects measured motion with the proposed mechanism at the same time and place.'},
      {id:'w7-stones-overreach',type:'single',prompt:'Which claim goes beyond the combined sources?',options:[['a','Thin ice, shallow water, sunlight, and wind moved many monitored rocks in December 2013.'],['b','Trails show that stones moved across the playa.'],['c','The 2013 observation proves every trail at every playa formed in exactly the same way.'],['d','Older trails can be compared with the monitored event.']],correct:'c',rationale:'The researchers did not observe every older trail or every playa.'}
     ],
     responses:[
      {id:'w7-stones-question',label:'1 · Main question or claim',prompt:'State the exact question you are investigating and the broad claim you will test.',rows:3},
      {id:'w7-stones-source1',label:'2 · What Source 1 establishes',prompt:'Summarize only what Source 1 directly establishes. Include one detail.',rows:4},
      {id:'w7-stones-source2',label:'3 · What Source 2 establishes',prompt:'Summarize only what Source 2 directly establishes. Include one detail.',rows:4},
      {id:'w7-stones-best',label:'4 · Strongest evidence',prompt:'Identify the strongest evidence and explain why it is stronger than a trail by itself.',rows:4},
      {id:'w7-stones-weak',label:'5 · Weak or irrelevant evidence',prompt:'Identify one detail that is true or interesting but weak for explaining how the rocks moved. Explain why.',rows:4},
      {id:'w7-stones-limit',label:'6 · Overreach and missing evidence',prompt:'Name one conclusion the sources cannot support and one piece of evidence still needed to make a broader claim.',rows:5},
      {id:'w7-stones-conclusion',label:'7 · Evidence-based conclusion',prompt:'Write a concise conclusion. Answer the question, combine both sources, state your confidence, and limit the claim to what the evidence establishes.',rows:8}
     ]
    },
    {
     id:'apollo-investigation',title:'Was Apollo 13 Lost Because of One Sudden Spark?',label:'Spaceflight failure investigation',sourceLabel:'Two original summaries of linked NASA records.',
     sources:[
      {title:'Apollo 13 mission details · NASA',url:'https://www.nasa.gov/missions/apollo/apollo-13-mission-details/'},
      {title:'Detailed chronology of the Apollo 13 accident · NASA',url:'https://www.nasa.gov/history/detailed-chronology-of-events-surrounding-the-apollo-13-accident/'}
     ],
     sections:[
      {heading:'Source 1 · Mission evidence',text:`On April 13, 1970, the Apollo 13 crew heard a bang and saw electrical warnings. Oxygen tank 2 lost pressure almost immediately; tank 1 then lost pressure over time. Astronaut Jim Lovell reported seeing gas vent into space. With normal electricity, water, and oxygen threatened, the crew moved into the lunar module and used it as a lifeboat while Mission Control developed new return procedures. These observations establish the in-flight sequence and consequences, but the crew could not see the hidden wiring inside the tank.`},
      {heading:'Source 2 · Investigation evidence',text:`The accident review traced a longer chain. Oxygen tank 2 had been damaged during an earlier removal. Before launch it would not empty normally, so ground teams used internal heaters for about eight hours. The ground system supplied 65 volts, but heater thermostatic switches had not been upgraded from a 28-volt design. Investigators concluded that the switches welded shut, temperatures rose high enough to damage wire insulation, and a later electrical event inside the tank ignited the failure. The report also noted that earlier warning signs and process checks had not prevented the launch.`}
     ],
     objectives:[
      {id:'w7-apollo-source',type:'single',prompt:'What does Source 1 establish most directly?',options:[['a','The exact manufacturing decision that damaged the wires'],['b','The observed in-flight sequence, oxygen loss, and emergency response'],['c','That no warning signs existed before launch'],['d','That the lunar module caused the explosion']],correct:'b',rationale:'Crew reports and system readings establish what happened in flight and how the crew responded.'},
      {id:'w7-apollo-strong',type:'single',prompt:'Which evidence most strongly challenges the phrase “one sudden spark with no earlier warning”?',options:[['a','The crew heard a bang.'],['b','The spacecraft was far from Earth.'],['c','The tank had prior damage, an abnormal prelaunch test, prolonged heating, and incompatible thermostat voltage.'],['d','Mission Control wrote new procedures.']],correct:'c',rationale:'Those connected records establish conditions and warning signs before the in-flight electrical event.'},
      {id:'w7-apollo-overreach',type:'single',prompt:'Which conclusion goes beyond these sources?',options:[['a','An in-flight electrical event was part of a longer failure chain.'],['b','Earlier damage and ground heating contributed to the conditions for failure.'],['c','The oxygen loss forced the crew to use the lunar module.'],['d','Every spacecraft accident is caused by ignored voltage warnings.']],correct:'d',rationale:'The sources investigate Apollo 13, not every spacecraft accident.'}
     ],
     responses:[
      {id:'w7-apollo-question',label:'1 · Main question or claim',prompt:'State the exact question you are investigating and the broad claim you will test.',rows:3},
      {id:'w7-apollo-source1',label:'2 · What Source 1 establishes',prompt:'Summarize only what Source 1 directly establishes. Include one detail.',rows:4},
      {id:'w7-apollo-source2',label:'3 · What Source 2 establishes',prompt:'Summarize only what Source 2 directly establishes. Include one detail.',rows:4},
      {id:'w7-apollo-best',label:'4 · Strongest evidence',prompt:'Identify the strongest evidence about the failure chain and explain why it is stronger than the bang alone.',rows:4},
      {id:'w7-apollo-weak',label:'5 · Weak or irrelevant evidence',prompt:'Identify one detail that is true or dramatic but weak for identifying the cause. Explain why.',rows:4},
      {id:'w7-apollo-limit',label:'6 · Overreach and missing evidence',prompt:'Name one conclusion the sources cannot support and one kind of evidence investigators would still need for greater confidence.',rows:5},
      {id:'w7-apollo-conclusion',label:'7 · Evidence-based conclusion',prompt:'Write a concise conclusion. Answer the question, combine both sources, state your confidence, and limit the claim to what the evidence establishes.',rows:8}
     ]
    }
   ]
  }
 ];
 window.READING_COURSE={
  schemaVersion:1,version:'2026.1',student:'Brody',grade:7,schoolYear:'2026–2027',
  title:'Evidence Lab · Seven-Week Reading Investigation',
  subtitle:'Read closely. Test the claim. Follow the evidence.',
  routine,rubric,standardsSource,weeks
 };
})();

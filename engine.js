/* ════════════════════════════════════════════════════════════
   列城之主 — game engine (logic preserved, UI rebound to 鎏金墨夜)
   ════════════════════════════════════════════════════════════ */

// ─── STORE ───
const Store={
  save(k,v){try{localStorage.setItem('warlord2_'+k,JSON.stringify(v))}catch(_){}},
  load(k){try{const v=localStorage.getItem('warlord2_'+k);return v?JSON.parse(v):null}catch(_){return null}},
  del(k){try{localStorage.removeItem('warlord2_'+k)}catch(_){}}
};

// ─── CONSTANTS ───
const CATL={collapse:'覆灭',bond:'羁绊',path:'歧途',hidden:'密径'};
const SK=['military','food','morale','intel'];
const SL={military:'兵',food:'粮',morale:'民',intel:'谋'};
const CY=['一','二','三','四','五','六','七','八','九','十'];
const CM=['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
const TIER_W={base:60,drain:135,deep:30,rare:10};
// emblem character shown in the (empty) illustration slot, per card channel
const EMBLEM={camp:'帅',war:'城',aman:'蛮',hongsiu:'商',qingzhao:'书',wuyue:'巫'};
// real illustrations, keyed by card id — add more here as art comes in
const CARD_IMG={};

const OPEN=[
  {c:'乱世之初',t:'遗孤',desc:'父亲死在一个没有月亮的夜里。留给你的只有一座破城、三千残兵，和五封来自五座城池的战书。<br>幕僚说你应该投降。士兵们在等你的命令。而你手里的兵符还带着父亲的体温。',btn:'接过兵符'},
  {c:'乱世之初',t:'兵符',desc:'兵符入手的瞬间，三千双眼睛同时看向你。有人眼里有希望，有人眼里有算计，更多的人眼里——什么都没有。<br>五座城池在地图上排成一条线。第一座，只有五百守军。',btn:'接过兵符'},
  {c:'乱世之初',t:'战书',desc:'五封战书铺在桌上。最近一座城的守将在信末写道：“稚子持刀，不过笑谈。”<br>你的幕僚建议先练兵。你的骑兵长说直接打。而粮仓里的存粮，只够三个月。',btn:'接过兵符'},
];

const ENDING_IMG={
  end_mil_0:'images/endings/end_mil_0.webp',
  end_mil_100:'images/endings/end_mil_100.webp',
  end_food_0:'images/endings/end_food_0.webp',
  end_food_100:'images/endings/end_food_100.webp',
  end_mor_0:'images/endings/end_mor_0.webp',
  end_mor_100:'images/endings/end_mor_100.webp',
  end_int_0:'images/endings/end_int_0.webp',
  end_int_100:'images/endings/end_int_100.webp',
  end_defeat_1:'images/endings/end_defeat_1.webp',
  end_defeat_2:'images/endings/end_defeat_2.webp',
  end_defeat_3:'images/endings/end_defeat_3.webp',
  end_defeat_4:'images/endings/end_defeat_4.webp',
  end_defeat_5:'images/endings/end_defeat_5.webp',
  end_aman_sub:'images/endings/end_aman_sub.webp',
  end_aman_fall:'images/endings/end_aman_fall.webp',
  end_hongsiu_sub:'images/endings/end_hongsiu_sub.webp',
  end_hongsiu_fall:'images/endings/end_hongsiu_fall.webp',
  end_qingzhao_sub:'images/endings/end_qingzhao_sub.webp',
  end_qingzhao_fall:'images/endings/end_qingzhao_fall.webp',
  end_wuyue_sub:'images/endings/end_wuyue_sub.webp',
  end_wuyue_fall:'images/endings/end_wuyue_fall.webp',
  end_tyrant:'images/endings/end_tyrant.webp',
  end_saint:'images/endings/end_saint.webp',
  end_lustking:'images/endings/end_lustking.webp',
  end_abandoned:'images/endings/end_abandoned.webp',
  end_unify:'images/endings/end_unify.webp',
  end_warlord:'images/endings/end_warlord.webp',
  end_emperor:'images/endings/end_emperor.webp',
  end_harem_king:'images/endings/end_harem_king.webp',
  end_retire:'images/endings/end_retire.webp',
  default:'images/ending_sample.webp'
};

// ─── RELICS ───
const RELICS={
  end_mil_0:{id:'drill',name:'练兵术',desc:'吃过兵变的亏，更懂得掌控军心',eff:{military_mult:.7}},
  end_food_0:{id:'granary',name:'屯粮策',desc:'饿过一次的人，不会让粮仓再见底',eff:{food_pos_mult:1.3}},
  end_mor_0:{id:'edict',name:'安民令',desc:'被百姓推翻过，才懂得倾听',eff:{morale_mult:.7}},
  end_int_0:{id:'scout',name:'暗哨经',desc:'中过一次伏，探子再没松懈',eff:{intel_mult:.7}},
  end_int_100:{id:'suspicion_mirror',name:'澄心镜',desc:'你学会压住过盛的疑心',eff:{intel_pos_mult:.45}},
  end_tyrant:{id:'sheath',name:'收刀诀',desc:'见过暴君下场，懂得何时收手',eff:{ruthless_mult:.5}},
  end_saint:{id:'iron_face',name:'铁面书',desc:'做过好人吃过亏，不再轻易点头',eff:{righteous_mult:.5}},
  end_lustking:{id:'sober_soup',name:'醒酒汤',desc:'沉溺过温柔乡，才知道什么时候该清醒',eff:{lust_mult:.5}},
  end_abandoned:{id:'bondcraft',name:'笼络术',desc:'被所有人抛弃过，微笑时更有温度',eff:{aff_pos_mult:1.3}},
  end_defeat_1:{id:'vanguard',name:'先锋旗',desc:'第一次失败，教会了你什么叫准备',eff:{siege_bonus:3}},
  end_defeat_5:{id:'last_plan',name:'遗策',desc:'差一步统一天下，那一步的教训刻骨铭心',eff:{siege_bonus:5}},
};

// ─── ENDINGS ───
const ENDINGS=[
  {id:'end_mil_0',cat:'collapse',title:'兵变',desc:'士兵们不再为你冲锋。他们选择了一个新的将军——你曾经最信任的副将。',hint:'军心散了，刀就会转向。'},
  {id:'end_mil_100',cat:'collapse',title:'军阀',desc:'你的将领们拥兵自重，架空了你。你还坐在帅位上，但号令已经出不了中军帐。',hint:'兵权太重，反而压断了帅旗。'},
  {id:'end_food_0',cat:'collapse',title:'饥荒',desc:'三千人的军队在第一场雪后饿散了。你最后的命令是让伙夫把战马也宰了。但那时候已经没人听令了。',hint:'空荡的粮仓，比敌军更致命。'},
  {id:'end_food_100',cat:'collapse',title:'腐粮',desc:'粮仓满得溢出来。贪腐从底层蔓延到幕僚。朝廷的问罪使者已经在路上了。',hint:'金山粮海，也会招来秃鹫。'},
  {id:'end_mor_0',cat:'collapse',title:'暴动',desc:'百姓揭竿而起。你以为自己是他们的保护者，最终却成为他们讨伐的目标。',hint:'失去民心的将军，连城门都出不去。'},
  {id:'end_mor_100',cat:'collapse',title:'圣人',desc:'百姓把你封为圣人。但圣人是不能打仗的。联军以"讨伐伪圣"为名兵临城下。',hint:'当赞歌变成枷锁，圣人与囚徒无异。'},
  {id:'end_int_0',cat:'collapse',title:'中伏',desc:'你走进了一个完美的陷阱。地图上标注的安全路线全是假的。最后看到的是漫山遍野的敌旗。',hint:'情报归零的那天，就是终局。'},
  {id:'end_int_100',cat:'collapse',title:'众叛',desc:'你怀疑所有人。幕僚连夜出逃，将领拒绝单独觐见。最后一个离开的人说："主公，您的敌人不在城外。"',hint:'多疑是一种慢性毒药。'},
  {id:'end_defeat_1',cat:'collapse',title:'溃败',desc:'第一座城的城墙比你想象的高。三千人冲上去，两千人退下来。你没有受伤，但你的旗帜被踩在了泥里。',hint:'准备不足的冲锋，不过是送死。'},
  {id:'end_defeat_2',cat:'collapse',title:'断粮',desc:'围城三个月后不是敌军投降，而是你的粮草先断了。',hint:'战争打的不是勇气，是后勤。'},
  {id:'end_defeat_3',cat:'collapse',title:'计中计',desc:'你以为自己在围城，其实是敌军在围你。',hint:'和谋士过招，不能只看棋盘。'},
  {id:'end_defeat_4',cat:'collapse',title:'圣战',desc:'圣城的民众不需要城墙。他们用信仰筑起了你攻不破的壁垒。',hint:'有些城池，不是用刀剑能攻破的。'},
  {id:'end_defeat_5',cat:'collapse',title:'功败垂成',desc:'王城近在咫尺。最后一战，你输了。不是输在兵力，是输在所有人都已经精疲力竭。',hint:'走到最后一步才倒下，是最残忍的失败。'},
  {id:'end_aman_sub',cat:'bond',title:'驯马',desc:'阿蛮跪在你的帅旗下，把草原的短刀横在掌心。她没有被你折断。她只是终于承认，能与她并肩冲锋的人，是你。',hint:'让野火愿意为你照亮前路。'},
  {id:'end_aman_fall',cat:'bond',title:'反噬',desc:'阿蛮吻你的时候仍像在撕咬。后来她带走了你的亲兵和战马，只留下一句笑话：草原不属于任何王。',hint:'别把野心误认成温顺。'},
  {id:'end_hongsiu_sub',cat:'bond',title:'金屋',desc:'红袖把天下账册铺满御案，指尖点过每一条商路。她笑着说，从今往后，你打你的江山，她替你数清江山的价钱。',hint:'让逐利之人相信你的胜算。'},
  {id:'end_hongsiu_fall',cat:'bond',title:'债主',desc:'你醒来时，库印、粮契、城防图都已换了主人。红袖坐在帘后饮茶，温柔地提醒你：情债也是债。',hint:'欠商人的东西，迟早要还。'},
  {id:'end_qingzhao_sub',cat:'bond',title:'折笔',desc:'清越折断了旧国密信的竹管，将碎片投入火中。火光照亮她的眼睛，也照亮你第一次读懂的沉默。',hint:'让敌国才女亲手放下旧笔。'},
  {id:'end_qingzhao_fall',cat:'bond',title:'间谍',desc:'清越在枕边留下半阙诗和一张空白地图。你这才明白，那些温柔的夜谈，每一句都曾被送往敌营。',hint:'最安静的人，也可能最危险。'},
  {id:'end_wuyue_sub',cat:'bond',title:'破戒',desc:'巫月摘下祭司的银冠，放在你掌心。殿外信徒仍在颂祷，她却只看着你，说神明也该学会退位。',hint:'让神殿的月光落向人间。'},
  {id:'end_wuyue_fall',cat:'bond',title:'献祭',desc:'祭坛上的火烧了一整夜。你以为那是加冕的圣焰，直到看见自己的名字被写进祭文最后一行。',hint:'被信仰爱上，不一定是幸事。'},
  {id:'end_tyrant',cat:'path',title:'暴君',desc:'你用铁血统一了一切。但没有人愿意为暴君立碑。你的名字会被后人从史书中划去。',hint:'杀得太多的人，史官的笔也不会放过。'},
  {id:'end_saint',cat:'path',title:'仁君',desc:'你太善良了。善良到所有人都觉得你好欺负。最后一个背叛你的人说："主公，您不适合这个乱世。"',hint:'善意铺成的路，有时通往深渊。'},
  {id:'end_lustking',cat:'path',title:'酒池肉林',desc:'你沉溺在温柔乡里。天下大业在美人的膝枕上慢慢腐烂。醒来时城已经被围了三天。',hint:'温柔乡是英雄冢。'},
  {id:'end_abandoned',cat:'path',title:'空帐',desc:'帐中陈设仍在，人却陆续远去。最后一封辞别信压在兵符下：主公既要天下，便不必再要我们。',hint:'留下不等于相守，人心久冷，帐中自空。'},
  {id:'end_unify',cat:'hidden',title:'一统天下',desc:'五面城旗在你的帅帐前飘扬。天下平定了。你站在最高的城墙上，看着曾经满目疮痍的大地。这一切值得吗？值得。',hint:'攻克五城，方为天下之主。'},
  {id:'end_warlord',cat:'hidden',title:'割据一方',desc:'你没能统一天下，但你活了下来。在这个吃人的乱世里，这本身就是一种胜利。',hint:'活着，就是最大的胜利。'},
  {id:'end_emperor',cat:'hidden',title:'千古一帝',desc:'你不仅统一了天下，还让它变得更好。史书上你的名字旁边只写了一个字：圣。',hint:'需要多次轮回的智慧。',mp:3},
  {id:'end_harem_king',cat:'hidden',title:'后宫之主',desc:'四位美人环绕，天下太平。完美吗？完美。但你已不记得哪个笑容是真心了。',hint:'需要经历更多轮回。',mp:5},
  {id:'end_retire',cat:'hidden',title:'弃甲归田',desc:'你把兵符压在旧地图上，转身走进春雨。身后仍有人喊你为王，但田埂上的泥很软，软得足够埋住一生的刀声。',hint:'有些胜利，是终于不再出征。',mp:7},
];

// ─── CARDS ───
const CARDS=[
{id:'c01',ch:'camp',tier:'base',theme:'沙场点兵',title:'逃兵',t:'校场上抓到三个逃兵。军法官等着你的命令。他们跪在地上发抖，其中最小的那个看起来不到十五岁。',l:{t:'杀一儆百。',f:{military:5,morale:-10},h:{ruthless:1}},r:{t:'军杖三十，发回营中。',f:{military:-50,morale:5},h:{righteous:1}}},
{id:'c02',ch:'camp',tier:'base',theme:'幕帷之间',title:'密报',t:'斥候带回消息：东边的诸侯正在秘密扩军。你的幕僚建议先发制人，但粮草刚刚补充完毕。',l:{t:'主动出击。',f:{military:5,food:-5,intel:5},h:{ruthless:1}},r:{t:'加强防御，静观其变。',f:{military:-5,food:8,intel:8},h:{righteous:1}}},
{id:'c03',ch:'camp',tier:'base',theme:'百姓苍生',title:'流民',t:'城外来了一大群流民。收留他们会消耗大量粮食，但赶走他们会失去民心。',l:{t:'紧闭城门。',f:{food:8,morale:-10},h:{ruthless:1}},r:{t:'开城收留。',f:{food:-5,morale:8,military:5},h:{righteous:1}}},
{id:'c04',ch:'camp',tier:'base',theme:'幕帷之间',title:'降将',t:'敌军有一位将领愿意投降。他带着三百精兵，但你的幕僚怀疑这是诈降。',l:{t:'拒绝，杀了他。',f:{military:-5,intel:5},h:{ruthless:1}},r:{t:'收编，但拆散他的部队。',f:{military:5,intel:-5},h:{righteous:1}}},
{id:'c05',ch:'camp',tier:'base',theme:'沙场点兵',title:'军械',t:'铸匠报告：打造新式攻城器械需要大量铁料。可以从商路购买，也可以收缴民间铁器。',l:{t:'收缴民间铁器。',f:{military:5,morale:-8},h:{ruthless:1}},r:{t:'花钱从商路购买。',f:{military:5,food:-5},h:{righteous:1}}},
{id:'c06',ch:'camp',tier:'base',theme:'百姓苍生',title:'赋税',t:'秋收将至。征收重税可以迅速充实粮仓，但百姓已经很苦了。',l:{t:'加征三成。',f:{food:8,morale:-10},h:{ruthless:1}},r:{t:'减免秋税。',f:{food:-5,morale:5},h:{righteous:1}}},
{id:'c07',ch:'camp',tier:'base',theme:'幕帷之间',title:'间谍',t:'你的情报头子抓到了一个敌方探子。严刑拷打还是怀柔策反？',l:{t:'拷打到他开口。',f:{intel:-10,morale:-5},h:{ruthless:1}},r:{t:'以礼相待，策反他。',f:{intel:5,food:-5},h:{righteous:1}}},
{id:'c08',ch:'camp',tier:'deep',mp:2,theme:'沙场点兵',title:'夜袭',t:'月黑风高。副将建议趁夜色突袭敌军粮草。成功了可以一战定胜负，失败了就是全军覆没。',l:{t:'太冒险了，不去。',f:{military:-5,intel:5},h:{}},r:{t:'亲自带队！',f:{military:5,food:8,intel:-8},h:{ruthless:1}}},
{id:'c09',ch:'camp',tier:'base',theme:'百姓苍生',title:'井水',t:'城南的井水发苦，百姓怀疑有人投毒。验水要时间，封井会让半座城断水。井边已经围满了人。',l:{t:'立刻封井。',f:{morale:-6,intel:8},h:{ruthless:1}},r:{t:'先派医官验水。',f:{food:-5,morale:6,intel:5},h:{righteous:1}}},
{id:'c10',ch:'camp',tier:'base',theme:'沙场点兵',title:'老卒',t:'一个瘸腿老卒请求退伍。他跟过你父亲，身上有七处旧伤。军法说临战不得离营，他说家里只剩一个瞎眼的娘。',l:{t:'军法无情。',f:{military:5,morale:-6},h:{ruthless:1}},r:{t:'赏银放归。',f:{food:-5,morale:8,military:-5},h:{righteous:1}}},
{id:'c11',ch:'camp',tier:'base',theme:'幕帷之间',title:'旧账',t:'父亲留下的账本里少了三十车粮。管库官跪在阶下，额头贴着地砖。他说那年冬天，城里快饿死人了。',l:{t:'按贪墨论斩。',f:{food:8,intel:5,morale:-8},h:{ruthless:1}},r:{t:'查清去向。',f:{intel:8,food:-5,morale:5},h:{righteous:1}}},
{id:'c12',ch:'camp',tier:'base',theme:'百姓苍生',title:'筑墙',t:'北墙塌了一段。工匠说要补墙，就得征发民夫；若只派士兵修，训练会耽误半月。',l:{t:'征发民夫。',f:{morale:-8},h:{ruthless:1}},r:{t:'士兵轮值修墙。',f:{military:-6,morale:6},h:{righteous:1}}},
{id:'c13',ch:'camp',tier:'base',theme:'沙场点兵',title:'缴械',t:'城内豪族私藏甲弩，被巡夜兵撞个正着。豪族长子跪在门前，说这些兵器原本是为了护院。',l:{t:'抄家入库。',f:{military:5,food:8,morale:-8},h:{ruthless:1}},r:{t:'罚银留人。',f:{food:8,intel:-7,morale:5},h:{righteous:1}}},
{id:'c14',ch:'camp',tier:'base',theme:'幕帷之间',title:'空印',t:'文书房发现几枚空白官印。幕僚脸色发白，这东西能伪造军令，也能伪造粮契。有人已经把窗纸割开了。',l:{t:'封房搜人。',f:{intel:5,morale:-6},h:{ruthless:1}},r:{t:'暗中放线。',f:{intel:6,food:-5},h:{}}},
{id:'c15',ch:'camp',tier:'base',theme:'百姓苍生',title:'冬衣',t:'第一场霜落下时，士兵们还穿着薄甲。布商愿意赊一批冬衣，但利息高得像刀。',l:{t:'强征布匹。',f:{military:5,morale:-10},h:{ruthless:1}},r:{t:'签下欠契。',f:{military:5,food:-7,morale:5},h:{righteous:1}}},
{id:'c16',ch:'camp',tier:'base',theme:'沙场点兵',title:'擂鼓',t:'新兵第一次听见战鼓，手里的长枪抖得像芦苇。教头问你，要不要把他们拉到城外见血。',l:{t:'带他们见血。',f:{military:5,morale:-5},h:{ruthless:1}},r:{t:'先练阵列。',f:{military:5,food:-5,morale:5},h:{}}},
{id:'c17',ch:'camp',tier:'base',theme:'幕帷之间',title:'客卿',t:'一个游士在酒肆里连破三局棋，点名要见你。他衣袖破旧，眼神却亮得吓人。幕僚说，太锋利的人不好用。',l:{t:'收入幕府。',f:{intel:9,food:-5},h:{}},r:{t:'赠金送走。',f:{intel:-7,food:-5},h:{righteous:1}}},
{id:'c18',ch:'camp',tier:'base',theme:'百姓苍生',title:'药铺',t:'疫病从南巷起。药铺掌柜把药价翻了三倍，门口躺着付不起钱的人。你的亲兵已经按住了刀柄。',l:{t:'没收药材。',f:{morale:8,intel:-7,food:-5},h:{ruthless:1}},r:{t:'官府买药施散。',f:{food:-9,morale:5},h:{righteous:1}}},
{id:'c19',ch:'camp',tier:'base',theme:'沙场点兵',title:'马市',t:'西来的马贩带来二十匹好马，也带来一身沙尘和几句听不懂的边语。骑兵长眼睛都亮了。',l:{t:'低价强买。',f:{military:5,morale:-5,intel:-5},h:{ruthless:1}},r:{t:'按价交易。',f:{military:7,food:-5},h:{}}},
{id:'c20',ch:'camp',tier:'base',theme:'幕帷之间',title:'谣言',t:'城里开始传，说你父亲不是死于意外。谣言像火星，落在每一张酒桌上。幕僚建议立刻抓几个舌头。',l:{t:'抓散谣者。',f:{intel:6,morale:-8},h:{ruthless:1}},r:{t:'顺藤摸瓜。',f:{intel:9,morale:-5},h:{}}},
{id:'c21',ch:'camp',tier:'base',theme:'百姓苍生',title:'河堤',t:'春汛将至，河堤裂开一条细缝。修堤会误了练兵，不修堤，城外良田可能全泡进水里。',l:{t:'先保军务。',f:{military:5,food:-5,morale:-5},h:{ruthless:1}},r:{t:'全力修堤。',f:{food:8,morale:8,military:-8},h:{righteous:1}}},
{id:'c22',ch:'camp',tier:'base',theme:'沙场点兵',title:'俘虏',t:'巡骑押回十几个敌军俘虏。他们冻得嘴唇发紫，有人愿意带路换一碗热粥。副将看着你，等一个眼色。',l:{t:'逼他们带路。',f:{intel:-8,morale:-5},h:{ruthless:1}},r:{t:'给粥再问。',f:{intel:5,food:-5,morale:5},h:{righteous:1}}},
{id:'c23',ch:'camp',tier:'base',theme:'幕帷之间',title:'假信',t:'敌营送来一封密信，笔迹像极了你父亲旧部。信上说，只要你今夜开门，就有人献城。',l:{t:'将计就计。',f:{intel:8,military:5},h:{}},r:{t:'烧掉，不理。',f:{intel:-7,morale:5},h:{}}},
{id:'c24',ch:'camp',tier:'base',theme:'百姓苍生',title:'婚丧',t:'城中大户同时办喜事和丧事，占了半条主街。士兵押粮车过不去，百姓却说这是乱世里难得的热闹。',l:{t:'清街通粮。',f:{food:7,morale:-5},h:{ruthless:1}},r:{t:'绕路慢行。',f:{food:-5,morale:6},h:{righteous:1}}},
{id:'c25',ch:'camp',tier:'base',theme:'沙场点兵',title:'缺弦',t:'弓营的弦断了三成。制弦匠说牛筋不够，只能从耕牛身上取。农户们把牛牵进院里，门闩落得很响。',l:{t:'取牛筋制弦。',f:{military:5,food:-5,morale:-8},h:{ruthless:1}},r:{t:'削减弓营训练。',f:{military:-6,food:8,morale:5},h:{}}},
{id:'c26',ch:'camp',tier:'base',theme:'幕帷之间',title:'夜宴',t:'邻城使者带酒来访，席间一直夸你年轻有为。他的袖口有淡淡火药味，笑容却稳得像一张面具。',l:{t:'当场扣人。',f:{intel:7,morale:-5},h:{ruthless:1}},r:{t:'陪他喝完。',f:{intel:-5,food:8,morale:5},h:{}}},
{id:'c27',ch:'camp',tier:'base',theme:'百姓苍生',title:'孤儿',t:'战场后方捡回一群孩子。他们抱着破木碗站在营门口，不哭，也不说话。士兵们把自己的干粮藏了起来。',l:{t:'送去寺院。',f:{food:8,morale:-5},h:{}},r:{t:'设孤营收养。',f:{food:-5,morale:9,intel:5},h:{righteous:1}}},
{id:'c28',ch:'camp',tier:'base',theme:'沙场点兵',title:'刀伤',t:'你巡视伤营时，一个断臂士兵用仅剩的手抓住你的衣角。他说不想回乡种地，还想留在军中。',l:{t:'编入敢死队。',f:{military:5,morale:-5},h:{ruthless:1}},r:{t:'任为教头。',f:{military:5,morale:7,food:-5},h:{righteous:1}}},
{id:'c29',ch:'camp',tier:'base',theme:'幕帷之间',title:'灯火',t:'深夜，幕府仍亮着灯。三名谋士为一条行军路线吵到拍案，其中一人把茶盏摔碎在地图上。',l:{t:'你来定。',f:{intel:-7,military:5,morale:5},h:{}},r:{t:'让他们辩完。',f:{intel:8,morale:-5},h:{}}},
{id:'c30',ch:'camp',tier:'base',theme:'百姓苍生',title:'盐价',t:'盐价一夜翻倍。卖盐的人说路断了，买盐的人说再这样就要吃土。你看见一个妇人把银簪压在秤盘上。',l:{t:'平价强售。',f:{morale:8,food:-5,intel:-5},h:{ruthless:1}},r:{t:'开官仓补贴。',f:{food:-5,morale:5},h:{righteous:1}}},
{id:'c31',ch:'camp',tier:'deep',mp:2,o:1,theme:'幕帷之间',title:'旧部',t:'父亲旧部深夜来见你。他没有行礼，只把一枚染黑的箭头放在案上。"当年那场意外，不是天灾。"帐外风声突然停了。',l:{t:'逼他说完。',f:{intel:5,morale:-6},h:{ruthless:1},a:['c31b']},r:{t:'先护他家眷。',f:{intel:6,food:-5,morale:5},h:{righteous:1},a:['c31b']}},
{id:'c31b',ch:'camp',tier:'deep',mp:2,o:1,theme:'幕帷之间',title:'黑箭',t:'箭头来自王城禁军。父亲死前最后一封信，被人从军档里抽走了。你终于摸到那只藏在旧案后的手。',l:{t:'清洗旧档房。',f:{intel:5,morale:-8},h:{ruthless:1}},r:{t:'只换管档人。',f:{intel:7,morale:5},h:{righteous:1}}},
{id:'c32',ch:'camp',tier:'deep',mp:2,theme:'沙场点兵',title:'沙盘',t:'你把五座城的沙盘摆在帐中，指尖从枯骨关一路推到龙椅台。每一粒沙都像一个会死的人。',l:{t:'练急行军。',f:{military:5,food:-5,intel:5},h:{}},r:{t:'补后勤线。',f:{food:9,military:-5,intel:5},h:{}}},
{id:'c33',ch:'camp',tier:'deep',mp:2,theme:'百姓苍生',title:'青苗',t:'新田刚冒出青苗，征粮吏就到了村口。老人把额头磕出血，只求你等到秋后。远处军鼓催得很急。',l:{t:'照旧征粮。',f:{food:8,morale:-10},h:{ruthless:1}},r:{t:'秋后再征。',f:{food:-6,morale:5},h:{righteous:1}}},
{id:'c34',ch:'camp',tier:'deep',mp:2,theme:'幕帷之间',title:'双面',t:'你的密探承认，他也收了敌国的钱。他没有求饶，只说自己带回来的情报从未错过。烛火把他的影子切成两半。',l:{t:'斩了换人。',f:{intel:-5,morale:5},h:{ruthless:1}},r:{t:'继续用他。',f:{military:-5,intel:5,morale:-6},h:{}}},
{id:'c35',ch:'camp',tier:'deep',mp:2,theme:'沙场点兵',title:'雪战',t:'大雪压弯军旗。敌军以为你不会在这种天气出兵，正把甲胄卸在火边烘。你的骑兵也冻得脸色发青。',l:{t:'雪夜突袭。',f:{military:5,food:8,morale:-6},h:{ruthless:1}},r:{t:'等雪停。',f:{military:-5,food:-5,intel:6},h:{}}},
{id:'c36',ch:'camp',tier:'deep',mp:2,theme:'百姓苍生',title:'祈雨',t:'旱了四十天，田地裂开白口。百姓抬着神像跪到府门前，求你亲自祈雨。幕僚说，王者不能轻易向天低头。',l:{t:'开渠引水。',f:{food:8,morale:5,military:-5},h:{}},r:{t:'披发祈雨。',f:{morale:5,intel:-5},h:{righteous:1}}},
{id:'c37',ch:'camp',tier:'rare',mp:7,o:1,theme:'幕帷之间',title:'退路',t:'一个无名道人在城门下卖旧草鞋。他看了你一眼，说："刀握太久，手会忘了怎么松开。"你忽然想起父亲从未写完的田契。',l:{t:'赶走道人。',f:{military:5,intel:-5},h:{ruthless:1}},r:{t:'买下草鞋。',f:{morale:5,intel:5},h:{},fl:'retire_ready'}},
{id:'c38',ch:'camp',tier:'base',theme:'沙场点兵',title:'白刃',t:'两队新兵在操场上练白刃，木枪撞得砰砰响。教头说要换真刀，只有见过血的手才不会在战场上抖。',l:{t:'换真刀。',f:{military:5,morale:-5},h:{ruthless:1}},r:{t:'先练木枪。',f:{military:5,food:-5,morale:5},h:{}}},
{id:'c39',ch:'camp',tier:'base',theme:'百姓苍生',title:'雨营',t:'连雨泡软了营地，帐脚全是泥。士兵们把湿靴挂在火边，怨气和霉味一起往上冒。',l:{t:'强令留营。',f:{military:5,morale:-7},h:{ruthless:1}},r:{t:'迁到高地。',f:{morale:6,military:-5,food:-5},h:{}}},
{id:'c40',ch:'camp',tier:'base',theme:'沙场点兵',title:'铁匠',t:'老铁匠把一柄新刀放到你面前，刀脊还泛着青光。他说铁料只够打一批刀，或打一批犁。',l:{t:'全打成刀。',f:{military:5,food:-6,morale:-5},h:{ruthless:1}},r:{t:'刀犁各半。',f:{military:5,food:8},h:{righteous:1}}},
{id:'c41',ch:'camp',tier:'base',theme:'百姓苍生',title:'赈册',t:'赈灾名册上多出几十个不存在的人名。书吏跪在地上喊冤，灾民的队伍已经排到府门外。',l:{t:'先斩书吏。',f:{food:8,intel:5,morale:-7},h:{ruthless:1}},r:{t:'先放赈粮。',f:{food:-9,morale:9,intel:5},h:{righteous:1}}},
{id:'c42',ch:'camp',tier:'base',theme:'沙场点兵',title:'边骑',t:'边境游骑来投，说愿意替你探路。他们马快，嘴也快，营里已经有人嫌他们不守规矩。',l:{t:'编入正军。',f:{military:7,intel:-5},h:{}},r:{t:'放作斥候。',f:{intel:8,military:5,morale:-5},h:{}}},
{id:'c43',ch:'camp',tier:'base',theme:'百姓苍生',title:'断桥',t:'南桥被洪水冲断，商队堵在河边。修桥要木料，木料正好也是造箭杆的好料。',l:{t:'先造箭杆。',f:{military:5,food:-5,morale:5},h:{ruthless:1}},r:{t:'先修南桥。',f:{food:8,morale:-5,military:5},h:{righteous:1}}},
{id:'c44',ch:'camp',tier:'base',theme:'幕帷之间',title:'私铸',t:'城西有人私铸铜钱，新钱薄得能透光。抓到的铸工说，不这么做，市面上根本没有钱流动。',l:{t:'封炉问斩。',f:{intel:7,morale:-6},h:{ruthless:1}},r:{t:'收归官炉。',f:{food:8,intel:5,morale:-5},h:{}}},
{id:'c45',ch:'camp',tier:'base',theme:'百姓苍生',title:'春耕',t:'春耕到了，壮丁却还在军中。村长捧着一把新土来见你，说今年若误了，明年就只能种坟。',l:{t:'军务优先。',f:{military:7,food:-5,morale:-5},h:{ruthless:1}},r:{t:'轮放归田。',f:{food:7,morale:6,military:-5},h:{righteous:1}}},
{id:'c46',ch:'camp',tier:'base',theme:'幕帷之间',title:'星象',t:'夜观台说赤星犯斗，主兵灾。副将嗤之以鼻，百姓却已经在市井里传开，连粮价都跟着晃了一下。',l:{t:'禁谈星象。',f:{intel:5,morale:-6},h:{ruthless:1}},r:{t:'借势练兵。',f:{military:6,morale:5,intel:-7},h:{}}},
{id:'c47',ch:'camp',tier:'base',theme:'沙场点兵',title:'换防',t:'东门守军连守二十日，眼圈黑得像墨。西门将领却说自己的兵刚练成阵，不能轻动。',l:{t:'强行轮换。',f:{morale:6,military:-5},h:{righteous:1}},r:{t:'东门再守。',f:{military:5,morale:-6,intel:5},h:{ruthless:1}}},
{id:'c48',ch:'camp',tier:'base',theme:'百姓苍生',title:'归葬',t:'阵亡士兵的家人来领骨灰。灰坛排满半条廊，风吹过时，白布轻轻贴到你的甲片上。',l:{t:'薄葬从简。',f:{food:8,morale:-7,military:-5},h:{ruthless:1}},r:{t:'厚葬立碑。',f:{food:-5,morale:9,military:5},h:{righteous:1}}},
{id:'c49',ch:'camp',tier:'base',theme:'幕帷之间',title:'火油',t:'商队带来二十坛火油。守城用它最好，攻城用它也狠，只是价钱够买半月军粮。',l:{t:'全数买下。',f:{military:8,food:-5},h:{}},r:{t:'只买一半。',f:{military:5,food:-5,intel:5},h:{}}},
{id:'c50',ch:'camp',tier:'base',theme:'沙场点兵',title:'鼓手',t:'老鼓手病倒了，新鼓手敲得太快，阵列跟着乱。有人建议让囚犯顶上，他以前在敌营敲过进军鼓。',l:{t:'用那个囚犯。',f:{military:5,intel:-7},h:{ruthless:1}},r:{t:'慢慢教新人。',f:{military:-5,morale:5},h:{righteous:1}}},
{id:'c51',ch:'camp',tier:'base',theme:'百姓苍生',title:'鱼税',t:'河港渔民拖来一网死鱼，说上游军营洗马污了水。税吏仍照旧收税，渔民的手已经握紧了船桨。',l:{t:'照税不误。',f:{food:7,morale:-8},h:{ruthless:1}},r:{t:'免税修渠。',f:{food:-5,morale:8,intel:5},h:{righteous:1}}},
{id:'c52',ch:'camp',tier:'base',theme:'幕帷之间',title:'旧印',t:'一枚旧朝官印从当铺里翻出来。印泥已经干裂，但盖在纸上，仍有人愿意跪下。',l:{t:'砸碎旧印。',f:{morale:-5,intel:6},h:{ruthless:1}},r:{t:'收入库中。',f:{intel:7,morale:5},h:{}}},
{id:'c53',ch:'camp',tier:'base',theme:'沙场点兵',title:'箭雨',t:'弓营试射，箭落得很密，也落得很偏。靶场旁的老兵说，再给三日，他能把这群孩子调教成雨。',l:{t:'三日太久。',f:{military:-5,intel:5},h:{}},r:{t:'给他三日。',f:{military:5,food:-5},h:{}}},
{id:'c54',ch:'camp',tier:'base',theme:'百姓苍生',title:'灯市',t:'元夜灯市照亮长街，百姓难得有了笑声。副将却说人群太密，若有刺客，连盾都举不开。',l:{t:'提前宵禁。',f:{intel:-7,morale:-7},h:{ruthless:1}},r:{t:'暗哨护市。',f:{morale:8,intel:5,food:-5},h:{}}},
{id:'c55',ch:'camp',tier:'base',theme:'幕帷之间',title:'病马',t:'马厩里三匹战马突然倒下，口吐白沫。马夫说是草料霉了，骑兵长说是有人下毒。',l:{t:'拷问马夫。',f:{intel:8,morale:-5},h:{ruthless:1}},r:{t:'先查草料。',f:{intel:6,food:-5,morale:5},h:{}}},
{id:'c56',ch:'camp',tier:'base',theme:'沙场点兵',title:'旗语',t:'新制的旗语太复杂，前锋看不懂，后军猜错了三次。谋士说复杂才难被敌人识破。',l:{t:'改回旧旗。',f:{military:5,intel:-7,morale:5},h:{}},r:{t:'继续训练。',f:{intel:7,military:-5},h:{}}},
{id:'c57',ch:'camp',tier:'base',theme:'百姓苍生',title:'产房',t:'军医被叫去产房接生，伤营却正缺人换药。两个传令兵同时跪在你面前，谁也不肯让路。',l:{t:'先救伤兵。',f:{military:6,morale:-5},h:{ruthless:1}},r:{t:'先去产房。',f:{morale:8,military:-5},h:{righteous:1}}},
{id:'c58',ch:'camp',tier:'base',theme:'幕帷之间',title:'酒令',t:'将领们在庆功宴上行酒令，越喝越不像话。有人提起旧朝王室，席间忽然安静了一瞬。',l:{t:'散宴禁酒。',f:{intel:5,morale:-5},h:{}},r:{t:'听他们说。',f:{intel:8,morale:5},h:{}}},
{id:'c59',ch:'camp',tier:'base',theme:'沙场点兵',title:'破甲',t:'铠甲匠展示一支破甲锥，能刺穿敌军重甲，却会拖慢士兵拔刀的速度。副将想立刻配发。',l:{t:'配给先锋。',f:{military:8,food:-5},h:{}},r:{t:'只给精锐。',f:{military:5,intel:5,food:-5},h:{}}},
{id:'c60',ch:'camp',tier:'base',theme:'百姓苍生',title:'戏台',t:'戏班在城门边唱旧朝亡国戏，百姓听得入神。唱到末尾，台下有人哭，有人骂，还有人看向你的旗。',l:{t:'禁唱旧戏。',f:{morale:-5,intel:7},h:{ruthless:1}},r:{t:'让他们唱。',f:{morale:7,intel:-5},h:{righteous:1}}},
{id:'c61',ch:'camp',tier:'deep',mp:2,theme:'幕帷之间',title:'暗渠',t:'城下有一条旧暗渠，直通护城河。老工匠说你父亲知道它，后来却命人把图纸烧了。',l:{t:'封死暗渠。',f:{intel:5,morale:5},h:{}},r:{t:'修成密道。',f:{intel:5,food:-5,morale:-5},h:{}}},
{id:'c62',ch:'camp',tier:'deep',mp:2,theme:'沙场点兵',title:'血旗',t:'一面染血旧旗从库房里翻出，是你父亲最后一战用过的。老兵们看见它，背脊一下挺直了。',l:{t:'挂上帅帐。',f:{military:8,morale:6,intel:-7},h:{}},r:{t:'留在库中。',f:{intel:5,morale:-5},h:{}}},
{id:'c63',ch:'camp',tier:'deep',mp:2,theme:'百姓苍生',title:'秋疫',t:'秋疫又起，死者被草席卷着抬出城。医官说要封坊七日，商人们说七日足够饿死一条街。',l:{t:'封坊七日。',f:{morale:-6,intel:8,food:-5},h:{ruthless:1}},r:{t:'开棚施药。',f:{morale:5,food:-5,intel:5},h:{righteous:1}}},
{id:'c64',ch:'camp',tier:'deep',mp:2,theme:'幕帷之间',title:'密会',t:'两个幕僚深夜在竹林相见，被巡兵撞破。他们说是在议军粮，你看见其中一人的袖中露出半截名单。',l:{t:'连夜拿人。',f:{intel:5,morale:-6},h:{ruthless:1}},r:{t:'放线追查。',f:{intel:5,food:-5},h:{}}},
{id:'c65',ch:'camp',tier:'deep',mp:2,theme:'沙场点兵',title:'孤城',t:'远处小城愿意归附，但要你派兵驻守。拿下它能作前哨，守不住就会变成一口吞兵的井。',l:{t:'派兵接城。',f:{military:-7,intel:8,morale:5},h:{}},r:{t:'只收降书。',f:{intel:5,morale:-5},h:{}}},
{id:'c66',ch:'camp',tier:'deep',mp:2,theme:'百姓苍生',title:'义仓',t:'几名乡老自发建了义仓，粮不多，却挂着你的名号。若收归官府，账会清楚；若放手，民心会热。',l:{t:'收归官府。',f:{food:8,intel:5,morale:-5},h:{}},r:{t:'让乡老管。',f:{morale:9,food:-5,intel:-5},h:{righteous:1}}},
{id:'c67',ch:'camp',tier:'deep',mp:2,theme:'幕帷之间',title:'影子',t:'你发现有个人总在远处看你。抓来一问，他说自己曾是父亲的影卫，只负责在必要时杀掉错误的人。',l:{t:'收作暗刃。',f:{intel:5,morale:-5},h:{ruthless:1}},r:{t:'遣他离城。',f:{morale:5,intel:-5},h:{righteous:1}}},
{id:'c68',ch:'camp',tier:'deep',mp:2,theme:'沙场点兵',title:'渡河',t:'敌军隔河扎营。河水不深，却冷得刺骨。若趁夜渡河，明早你会站在他们背后，或躺在河底。',l:{t:'夜渡突袭。',f:{military:5,intel:-6,morale:-5},h:{ruthless:1}},r:{t:'搭桥稳进。',f:{military:5,food:-7,intel:5},h:{}}},
{id:'c69',ch:'camp',tier:'deep',mp:2,theme:'百姓苍生',title:'碑文',t:'新立的战死碑还空着一半。石匠问要不要刻上敌军的名字，他说死人在地下未必还分阵营。',l:{t:'只刻己方。',f:{military:5,morale:-5},h:{}},r:{t:'一并刻上。',f:{morale:8,intel:-5},h:{righteous:1}}},
{id:'c70',ch:'camp',tier:'deep',mp:2,theme:'幕帷之间',title:'献图',t:'一个哑巴乞儿献来王城外郭图。图画得极细，细到连巡夜狗窝都标了出来。没人知道他从哪来。',l:{t:'扣下乞儿。',f:{intel:5,morale:-5},h:{ruthless:1}},r:{t:'赏饭放走。',f:{intel:7,morale:5,food:-5},h:{righteous:1}}},
{id:'c71',ch:'camp',tier:'rare',o:1,cm:42,theme:'幕帷之间',title:'五城图',t:'五座城在地图上连成一线。幕僚说，线的尽头不是王座，而是一张会吞人的网。你听见帐外风吹旗角，像有人磨刀。',l:{t:'重排战线。',f:{intel:8,food:8,military:-5},h:{}},r:{t:'照旧推进。',f:{military:8,morale:5,intel:-6},h:{ruthless:1}}},
{id:'c72',ch:'camp',tier:'rare',o:1,mp:5,theme:'幕帷之间',title:'旧梦',t:'你在黎明前醒来，梦见自己曾经坐上王座，又亲手把王座推翻。案上的兵符很安静，像什么都记得。',l:{t:'压下此梦。',f:{military:5,intel:5},h:{}},r:{t:'记入密档。',f:{intel:5,morale:-5},h:{}}},
{id:'c73',ch:'camp',tier:'base',o:1,theme:'沙场点兵',title:'军约',t:'新兵入营第一夜，几名老卒把军规背得滚瓜烂熟，却没人知道百姓被误伤时该怎么算。军法官问你，要不要把这条也写进军约。',l:{t:'立约三章。',f:{morale:6,intel:5,military:-5},h:{righteous:1},a:['c73b']},r:{t:'照旧军法。',f:{military:5,morale:-5},h:{ruthless:1}}},
{id:'c73b',ch:'camp',tier:'deep',o:1,theme:'百姓苍生',title:'初犯',t:'军约刚贴出去，就有一名骑兵踩坏了农家的麦田。他哭着说是追敌误入，不是有心。田边围着百姓，也围着士兵。',l:{t:'按约赔罚。',f:{morale:5,intel:5,military:-5},h:{righteous:1},a:['c73c']},r:{t:'破例从轻。',f:{morale:5,intel:-5},h:{righteous:1}}},
{id:'c73c',ch:'camp',tier:'rare',o:1,theme:'幕帷之间',title:'成文',t:'一个月后，军约被抄成小册，在营里和市井里同时流传。有人说这是仁政，有人说这是给将军的刀套上鞘。',l:{t:'公开颁行。',f:{morale:7,intel:5,food:-5},h:{righteous:1}},r:{t:'只作内规。',f:{military:5,intel:5,morale:-5},h:{}}},
{id:'c74',ch:'camp',tier:'deep',mp:2,o:1,theme:'幕帷之间',title:'密线',t:'一名小吏说，他能在敌城里铺出一条密线。要钱，要人，也要你允许他做几件账面上不好看的事。',l:{t:'暂缓此事。',f:{food:8,intel:-5},h:{}},r:{t:'拨银建线。',f:{food:-5,intel:6},h:{},a:['c74b']}},
{id:'c74b',ch:'camp',tier:'deep',mp:2,o:1,theme:'幕帷之间',title:'空巷',t:'密线传回第一封信：敌城东巷今夜无人巡逻。斥候却说，越是空的巷子，越像有人特意清出来的口袋。',l:{t:'立刻收网。',f:{intel:6,morale:-5},h:{ruthless:1},a:['c74c']},r:{t:'再放一夜。',f:{intel:5,food:-5,morale:5},h:{},a:['c74c']}},
{id:'c74c',ch:'camp',tier:'rare',mp:2,o:1,theme:'幕帷之间',title:'名单',t:'密线最后送来一份名单。上面有敌城暗桩，也有你营中几个熟悉的名字。墨迹未干，帐外已经有人开始发抖。',l:{t:'只抓首恶。',f:{intel:5,morale:5,food:-5},h:{righteous:1}},r:{t:'一并清洗。',f:{intel:8,morale:-8},h:{ruthless:1}}},
{id:'c75',ch:'camp',tier:'deep',mp:3,o:1,theme:'乱世之初',title:'旧碑',t:'攻下一座小寨后，你在荒草里发现一块无名旧碑。碑上没有姓名，只有一句被雨水磨浅的话：此路曾败。',l:{t:'立无名碑。',f:{morale:6,food:-5},h:{righteous:1},a:['c75b']},r:{t:'封存旧甲。',f:{military:5,intel:5,morale:-5},h:{}}},
{id:'c75b',ch:'camp',tier:'deep',mp:3,o:1,theme:'乱世之初',title:'梦中败军',t:'那夜你梦见同一条山路，同一面折断的帅旗。醒来时，地图上的朱砂线被汗水晕开，像一场还没发生的败仗。',l:{t:'照梦改阵。',f:{military:5,intel:5,food:-5},h:{},a:['c75c']},r:{t:'梦只是梦。',f:{morale:5,intel:-5},h:{}}},
{id:'c75c',ch:'camp',tier:'rare',mp:3,o:1,theme:'乱世之初',title:'重演',t:'后来你真的走到那条山路前。斥候说敌军就在坡后，副将说正面破过去最快。风吹过旧碑，像有人在很远处叹气。',l:{t:'避开旧路。',f:{intel:6,food:8,military:-5},h:{}},r:{t:'正面破局。',f:{military:6,morale:5,food:-5},h:{ruthless:1}}},
{id:'c76',ch:'camp',tier:'base',o:1,theme:'百姓苍生',title:'义军',t:'城外来了一支自称义军的队伍。他们衣甲不整，却一路护送流民到城下。副将说他们难管，百姓说他们像自己人。',l:{t:'收编入营。',f:{military:6,morale:5,food:-5},h:{},a:['c76b']},r:{t:'给粮遣散。',f:{morale:6,food:-5},h:{righteous:1}}},
{id:'c76b',ch:'camp',tier:'deep',o:1,theme:'沙场点兵',title:'义旗',t:'义军入营后仍打着自己的旗。新兵们喜欢那面旗，老将们却觉得营里多了一道不听号令的声音。',l:{t:'撤旗归编。',f:{military:5,intel:5,morale:-5},h:{ruthless:1},a:['c76c']},r:{t:'准其保旗。',f:{morale:7,military:-5,intel:-5},h:{righteous:1},a:['c76c']}},
{id:'c76c',ch:'camp',tier:'rare',o:1,theme:'沙场点兵',title:'先锋请战',t:'攻城前，义军首领请为先锋。他说他们不是为你卖命，是为城下那些还有家可回的人卖命。所有人都在等你的答复。',l:{t:'让他们先登。',f:{military:7,morale:-5},h:{ruthless:1}},r:{t:'让正规军并肩。',f:{military:5,morale:6,food:-5},h:{righteous:1}}},
{id:'c77',ch:'camp',tier:'base',o:1,theme:'百姓苍生',title:'盐引',t:'盐商联名求见，说只要给他们三年盐引，愿意立刻借粮给军中。百姓在门外等盐价，军需官在门内等粮车。',l:{t:'准三年盐引。',f:{food:8,morale:-5,intel:-5},h:{},a:['c77b']},r:{t:'只准一年。',f:{food:8,intel:5,morale:-5},h:{},a:['c77b']}},
{id:'c77b',ch:'camp',tier:'deep',o:1,theme:'幕帷之间',title:'盐船',t:'第一批盐船抵达时，船底夹着几箱私铁。盐商说那是护船兵器，管税吏却看见了敌城的火漆。',l:{t:'扣船查账。',f:{intel:7,food:-5,morale:5},h:{},a:['c77c']},r:{t:'装作没看见。',f:{food:6,intel:-5,morale:-5},h:{ruthless:1},a:['c77c']}},
{id:'c77c',ch:'camp',tier:'rare',o:1,theme:'百姓苍生',title:'盐价',t:'盐价终于降了，却有人发现账本里少了一行名字。那一行对应的村子，正好在敌军行路图上。',l:{t:'公开审盐商。',f:{morale:6,intel:5,food:-5},h:{righteous:1}},r:{t:'秘密换掉他们。',f:{intel:8,morale:-5},h:{ruthless:1}}},
{id:'c78',ch:'camp',tier:'base',o:1,theme:'百姓苍生',title:'医棚',t:'军医请求在城门外搭医棚，收治流民和轻伤兵。副将担心疫病进城，医官只说不治，病也会自己走进来。',l:{t:'城外设棚。',f:{morale:6,food:-5,intel:5},h:{righteous:1},a:['c78b']},r:{t:'只治军中。',f:{military:5,morale:-5},h:{ruthless:1}}},
{id:'c78b',ch:'camp',tier:'deep',o:1,theme:'百姓苍生',title:'药方',t:'医棚里传出一张药方，百姓照方煎药，士兵也偷偷来讨。药材耗得很快，药铺掌柜已经开始抬价。',l:{t:'官府收药。',f:{morale:5,food:-5,intel:5},h:{},a:['c78c']},r:{t:'让药铺自售。',f:{food:8,morale:-6,intel:-5},h:{},a:['c78c']}},
{id:'c78c',ch:'camp',tier:'rare',o:1,theme:'幕帷之间',title:'疫图',t:'医官把染疫的街巷画成一张图。图上有几处红点，正贴着粮道和兵营。你终于看清，病也会排兵布阵。',l:{t:'按图封坊。',f:{intel:7,morale:-5,food:-5},h:{ruthless:1}},r:{t:'按图施药。',f:{morale:7,intel:5,food:-6},h:{righteous:1}}},
{id:'c79',ch:'camp',tier:'base',o:1,theme:'幕帷之间',title:'童谣',t:'城中孩子开始唱一首新童谣，唱你会拿五座城，也唱你会卖掉第六座。歌词押韵得太巧，不像孩子自己编的。',l:{t:'查童谣源头。',f:{intel:6,morale:-5},h:{},a:['c79b']},r:{t:'由他们唱。',f:{morale:5,intel:-7},h:{righteous:1}}},
{id:'c79b',ch:'camp',tier:'deep',o:1,theme:'幕帷之间',title:'说书人',t:'线索指向一个说书人。他在茶摊讲你的故事，讲得比战报还真。问他从哪听来，他只指了指满座的听客。',l:{t:'带回幕府。',f:{intel:7,morale:-5},h:{ruthless:1},a:['c79c']},r:{t:'请他继续讲。',f:{morale:6,intel:5,food:-5},h:{},a:['c79c']}},
{id:'c79c',ch:'camp',tier:'rare',o:1,theme:'百姓苍生',title:'新词',t:'几日后，城里换了新词。有人唱你仁厚，有人唱你残忍，更多人只是借着调子问：下一座城，会死谁？',l:{t:'改词安民。',f:{morale:7,intel:-5,food:-5},h:{righteous:1}},r:{t:'借词惑敌。',f:{intel:8,morale:-5},h:{}}},
{id:'c80',ch:'camp',tier:'deep',mp:2,o:1,theme:'幕帷之间',title:'借刀',t:'邻国使者暗中送来一封信，愿借你兵马去除共同的敌人。信末没有署名，只有一枚很新很干净的血印。',l:{t:'烧信拒绝。',f:{morale:5,intel:5,military:-5},h:{}},r:{t:'借刀一试。',f:{military:6,intel:-7,morale:-5},h:{ruthless:1},a:['c80b']}},
{id:'c80b',ch:'camp',tier:'deep',mp:2,o:1,theme:'幕帷之间',title:'夜火',t:'那支借来的兵马夜里烧了敌军粮仓，也烧了三户民宅。使者说乱军难免，百姓说火不会认旗。',l:{t:'赔民宅。',f:{morale:6,food:-5,intel:5},h:{righteous:1},a:['c80c']},r:{t:'压下火案。',f:{military:5,intel:5,morale:-7},h:{ruthless:1},a:['c80c']}},
{id:'c80c',ch:'camp',tier:'rare',mp:2,o:1,theme:'幕帷之间',title:'还刀',t:'使者来索还人情。他不要粮，不要城，只要你在下一封战书上慢一天落印。幕僚听完，脸色比纸还白。',l:{t:'撕毁旧约。',f:{intel:5,morale:5,military:-5},h:{}},r:{t:'拖延一日。',f:{food:8,intel:-6,morale:-5},h:{}}},
{id:'c81',ch:'camp',tier:'deep',mp:2,o:1,theme:'沙场点兵',title:'边盟',t:'边地三寨愿与你结盟。他们能出骑兵，也能断敌粮道，但要求保留自己的法和仇。',l:{t:'以军法收盟。',f:{military:6,intel:5,morale:-5},h:{ruthless:1},a:['c81b']},r:{t:'以盟约相待。',f:{military:5,morale:5,food:-5},h:{righteous:1},a:['c81b']}},
{id:'c81b',ch:'camp',tier:'deep',mp:2,o:1,theme:'百姓苍生',title:'旧仇',t:'边寨骑兵抓到一名仇家的少年，说按他们的法，该拿血还血。少年跪在你面前，听不懂中原话，只知道害怕。',l:{t:'按中原法审。',f:{morale:6,intel:5,military:-5},h:{righteous:1},a:['c81c']},r:{t:'尊边寨旧法。',f:{military:5,morale:-6},h:{ruthless:1},a:['c81c']}},
{id:'c81c',ch:'camp',tier:'rare',mp:2,o:1,theme:'沙场点兵',title:'边鼓',t:'大战前夜，边寨骑兵敲起自己的鼓。鼓声和你的战鼓不合拍，却让敌军整夜没敢合眼。',l:{t:'并鼓齐进。',f:{military:7,morale:5,food:-5},h:{}},r:{t:'令其侧袭。',f:{military:5,intel:5,morale:-5},h:{}}},
{id:'c82',ch:'camp',tier:'rare',mp:3,o:1,theme:'乱世之初',title:'遗诏',t:'旧朝遗诏在一只夹层匣里露出半角。它承认了你父亲的功，也承认了他不该知道的秘密。',l:{t:'藏入密库。',f:{intel:7,morale:-5},h:{},a:['c82b']},r:{t:'召幕僚共读。',f:{intel:5,morale:5,food:-5},h:{},a:['c82b']}},
{id:'c82b',ch:'camp',tier:'deep',mp:3,o:1,theme:'幕帷之间',title:'旧臣',t:'读过遗诏后，几个旧臣连夜登门。他们称你为少主，声音恭敬得像一把蒙着布的刀。',l:{t:'收作顾问。',f:{intel:6,food:-5,morale:5},h:{},a:['c82c']},r:{t:'逐出城去。',f:{morale:-5,intel:5,military:5},h:{ruthless:1}}},
{id:'c82c',ch:'camp',tier:'rare',mp:3,o:1,theme:'乱世之初',title:'旧旗',t:'旧臣献出一面旧朝王旗。举它，许多城门会动摇；不举它，你仍只是破城里走出的年轻将军。',l:{t:'举旧旗惑城。',f:{intel:7,morale:-6,military:5},h:{}},r:{t:'只举自己的旗。',f:{morale:6,military:5,intel:-7},h:{}}},
{id:'c83',ch:'camp',tier:'rare',mp:4,o:1,theme:'幕帷之间',title:'无名军师',t:'一个戴斗笠的人在雨里等你。他只说三句话，就指出你军中两处死穴。问他姓名，他说名字会让人懒得思考。',l:{t:'请入幕府。',f:{intel:8,food:-5,morale:-5},h:{},a:['c83b']},r:{t:'赏金送走。',f:{intel:5,food:-5},h:{}}},
{id:'c83b',ch:'camp',tier:'deep',mp:4,o:1,theme:'幕帷之间',title:'三策',t:'无名军师献上三策：上策慢，中策险，下策快。副将喜欢下策，粮官喜欢上策，而他只看着你。',l:{t:'取上策。',f:{food:8,intel:5,military:-5},h:{},a:['c83c']},r:{t:'取中策。',f:{military:5,intel:5,morale:-5},h:{},a:['c83c']}},
{id:'c83c',ch:'camp',tier:'rare',mp:4,o:1,theme:'乱世之初',title:'无名之名',t:'计成之后，他把斗笠留在案上，人却不见了。斗笠内侧写着你父亲的笔迹：若他来，不要全信，也不要不信。',l:{t:'查他的来路。',f:{intel:8,morale:-5,food:-5},h:{}},r:{t:'留他的空席。',f:{morale:5,intel:5,military:-5},h:{}}},
{id:'c84',ch:'camp',tier:'base',theme:'沙场点兵',title:'磨枪',t:'枪头钝了，磨刀石却不够。军械官说先给前锋，教头说新兵更需要一杆能信得过的枪。',l:{t:'先给前锋。',f:{military:6,morale:-5},h:{}},r:{t:'均分各营。',f:{military:5,food:-5,morale:5},h:{}}},
{id:'c85',ch:'camp',tier:'base',theme:'沙场点兵',title:'哨骑',t:'两名哨骑争着出城探路。一个熟悉山路，一个熟悉敌营口音。副将说只能派一个，另一个要守住后路。',l:{t:'派熟山路的。',f:{intel:5,military:5,food:-5},h:{}},r:{t:'派懂口音的。',f:{intel:7,morale:-5},h:{}}},
{id:'c86',ch:'camp',tier:'base',theme:'沙场点兵',title:'操甲',t:'新甲刚到，士兵穿上后跑不快。工匠说多练几日就好，骑兵长却嫌它拖慢冲阵。',l:{t:'穿甲苦练。',f:{military:6,food:-5,morale:-5},h:{}},r:{t:'轻甲出阵。',f:{military:5,intel:5,morale:-5},h:{}}},
{id:'c87',ch:'camp',tier:'base',theme:'百姓苍生',title:'井市',t:'集市旁新挖了一口井，百姓排队取水，军营也想接一条水渠。井绳磨得发亮，争执也快磨出火星。',l:{t:'先供军营。',f:{military:5,morale:-5,food:8},h:{ruthless:1}},r:{t:'按户分水。',f:{morale:6,food:-5},h:{righteous:1}}},
{id:'c88',ch:'camp',tier:'base',theme:'百姓苍生',title:'麦种',t:'乡老求一批麦种，说今年播下去，明年军粮就有根。粮官提醒你，种子也能熬粥。',l:{t:'留作军粮。',f:{food:6,morale:-5},h:{ruthless:1}},r:{t:'发给乡里。',f:{food:-5,morale:7,intel:5},h:{righteous:1}}},
{id:'c89',ch:'camp',tier:'base',theme:'百姓苍生',title:'木匠',t:'城里木匠被征去修车架，家中却还有倒塌的屋梁。雨季将近，他的妻子抱着孩子站在工棚外。',l:{t:'军车要紧。',f:{military:5,morale:-6},h:{ruthless:1}},r:{t:'轮班归家。',f:{morale:6,military:-5,food:-5},h:{righteous:1}}},
{id:'c90',ch:'camp',tier:'base',theme:'幕帷之间',title:'墨迹',t:'一份军令上的墨迹被水晕开，最后一个字像退，也像进。传令兵跪在地上，等你给它一个确定的意思。',l:{t:'按进字办。',f:{military:5,intel:-7,morale:5},h:{ruthless:1}},r:{t:'重发军令。',f:{intel:6,food:-5},h:{}}},
{id:'c91',ch:'camp',tier:'base',theme:'幕帷之间',title:'棋客',t:'幕府来了个棋客，连胜三名谋士。他不求官，只求在沙盘边坐一晚。你的亲兵不喜欢他的眼神。',l:{t:'许他旁观。',f:{intel:7,morale:-5},h:{}},r:{t:'只留棋谱。',f:{intel:5,food:-5,morale:5},h:{}}},
{id:'c92',ch:'camp',tier:'base',theme:'幕帷之间',title:'错名',t:'阵亡名册上多了一个活人的名字。那士兵站在门口，脸色白得像已经死过一次。书吏说只是笔误。',l:{t:'彻查名册。',f:{intel:6,morale:5,food:-5},h:{}},r:{t:'改了便是。',f:{military:5,intel:-7,morale:-5},h:{}}},
{id:'c93',ch:'war',tier:'deep',theme:'沙场点兵',title:'云梯',t:'攻城匠造出一架新云梯，轻便却不够稳。试梯的新兵爬到一半，手心全是汗。',l:{t:'先试十架。',f:{military:5,food:-5,intel:5},h:{}},r:{t:'稳妥加固。',f:{military:5,food:-5,morale:5},h:{}}},
{id:'c94',ch:'war',tier:'deep',theme:'沙场点兵',title:'壕沟',t:'敌城外挖了两道壕沟。填壕要木料和人命，绕路则会多耗半月粮草。',l:{t:'夜里填壕。',f:{military:5,morale:-5,intel:5},h:{ruthless:1}},r:{t:'绕西坡走。',f:{food:-6,intel:5},h:{}}},
{id:'c95',ch:'war',tier:'deep',theme:'幕帷之间',title:'降书',t:'城上射下一封降书，说愿开东门，但要保全守将家眷。副将怀疑是拖延，粮官却看向越来越空的车队。',l:{t:'答应条件。',f:{morale:5,intel:5,food:-5},h:{}},r:{t:'继续围困。',f:{military:5,food:-5,morale:-5},h:{ruthless:1}}},
{id:'c96',ch:'camp',tier:'deep',mp:2,theme:'乱世之初',title:'旧靴',t:'库房翻出一双旧靴，靴底还嵌着边关的黑泥。老兵说那是你父亲年轻时穿过的，没人敢擦干净。',l:{t:'供在帅帐。',f:{morale:5,military:5,intel:-5},h:{}},r:{t:'赏给老兵。',f:{morale:6,food:-5},h:{righteous:1}}},
{id:'c97',ch:'camp',tier:'deep',mp:2,theme:'乱世之初',title:'乳名',t:'一个老仆醉后喊出了你的乳名，满帐忽然安静。那名字像从很久以前滚出来，撞在现在的兵甲上。',l:{t:'罚他失礼。',f:{military:5,morale:-5,intel:5},h:{ruthless:1}},r:{t:'扶他醒酒。',f:{morale:5,food:-5},h:{righteous:1}}},
{id:'c98',ch:'camp',tier:'deep',mp:3,theme:'乱世之初',title:'旧铃',t:'父亲留下的马铃忽然响了。没有风，也没有马。守夜人说他听见铃声里夹着行军号。',l:{t:'挂上战马。',f:{military:5,morale:5,intel:-5},h:{}},r:{t:'收入密匣。',f:{intel:6,morale:-5},h:{}}},
{id:'c99',ch:'camp',tier:'base',theme:'帷帐春深',title:'帘影',t:'夜里帐帘上映出两个人影，一个是你的侍卫，一个是来送汤的侍女。流言比汤先热起来。',l:{t:'严禁闲话。',f:{intel:5,morale:-5},h:{ruthless:1}},r:{t:'赏汤给众人。',f:{morale:5,food:-5},h:{}}},
{id:'c100',ch:'camp',tier:'base',theme:'帷帐春深',title:'旧香',t:'有人在你的案头放了一只旧香囊，针脚细密，却没有署名。军令压在香气下，一时显得太硬。',l:{t:'交给内侍。',f:{intel:5,morale:-5},h:{}},r:{t:'留在案边。',f:{morale:5,intel:-5},h:{lust:1}}},
{id:'c101',ch:'camp',tier:'base',theme:'帷帐春深',title:'夜汤',t:'深夜仍有人给你送汤。汤很淡，像怕打扰你思考。端汤的人说，主公也该记得自己还是活人。',l:{t:'喝完再议。',f:{morale:5,food:-5},h:{righteous:1}},r:{t:'先看军报。',f:{intel:5,morale:-5},h:{}}},
{id:'c102',ch:'camp',tier:'base',theme:'沙场点兵',title:'铁令',t:'副将呈上一份新军令：赏罚翻倍，逃者斩，先登者重赏。它能立刻让营中安静下来，也会让每个士兵睡觉时都握着刀。',l:{t:'即刻颁行。',f:{military:10,food:-8,morale:-8},h:{ruthless:1}},r:{t:'暂缓三日。',f:{military:-50,morale:6,intel:5},h:{righteous:1}}},
{id:'c103',ch:'camp',tier:'base',theme:'沙场点兵',title:'夺马',t:'骑兵缺马，城外却有几百匹民马正在耕田。骑兵长说误了战机就没有来年，乡老说没了马也没有来年。',l:{t:'征走民马。',f:{military:10,morale:-12,food:-5},h:{ruthless:1}},r:{t:'高价买马。',f:{military:9,food:-12,morale:5},h:{}}},
{id:'c104',ch:'camp',tier:'base',theme:'沙场点兵',title:'溃营',t:'一支新营夜里哗变，没冲出营门就被按下。现在他们跪在泥里，老兵们站在旁边，看你会把军法烧到多热。',l:{t:'斩首示众。',f:{military:10,morale:-14,intel:5},h:{ruthless:1}},r:{t:'开营自首。',f:{military:-52,morale:10,food:-5},h:{righteous:1}}},
{id:'c105',ch:'camp',tier:'base',theme:'百姓苍生',title:'大征',t:'粮官说只要再征一轮，粮仓就能撑到下一座城。城外村里却刚把种粮埋进土里，春风还没来得及吹热。',l:{t:'征尽余粮。',f:{food:16,morale:-14,intel:-5},h:{ruthless:1}},r:{t:'留下种粮。',f:{food:-12,morale:9},h:{righteous:1}}},
{id:'c106',ch:'camp',tier:'base',theme:'百姓苍生',title:'焚券',t:'百姓欠下的粮债堆成一箱，红印像干掉的血。烧了它，民心会回来；留着它，军粮就还有着落。',l:{t:'当众烧券。',f:{morale:14,food:-10,intel:-7},h:{righteous:1}},r:{t:'照券追粮。',f:{food:12,morale:-12},h:{ruthless:1}}},
{id:'c107',ch:'camp',tier:'base',theme:'幕帷之间',title:'黑仓',t:'暗账指向一座私仓，里面可能藏着救命粮，也可能藏着足够掀翻半个幕府的人名。查或不查，粮仓都会少一层灰。',l:{t:'封仓查账。',f:{food:-14,intel:12,morale:5},h:{}},r:{t:'压下账本。',f:{food:14,intel:-12,morale:-5},h:{ruthless:1}}},
{id:'c108',ch:'camp',tier:'base',theme:'百姓苍生',title:'众怒',t:'府门外跪满了人，哭声从清晨压到黄昏。亲兵说再不开门，他们就要撞门；幕僚说门一开，威严就会漏出去。',l:{t:'开门听诉。',f:{morale:13,military:-8,food:-5},h:{righteous:1}},r:{t:'闭门清街。',f:{morale:-15,military:8,intel:5},h:{ruthless:1}}},
{id:'c109',ch:'camp',tier:'base',theme:'百姓苍生',title:'徙民',t:'为了腾出军营，你可以把城南三条街的百姓迁走。地图上只是三条细线，街上却是几百口灶和几千只眼睛。',l:{t:'强迁城南。',f:{military:9,food:6,morale:-16},h:{ruthless:1}},r:{t:'另寻空地。',f:{morale:8,military:-9,intel:-7},h:{}}},
{id:'c110',ch:'camp',tier:'base',theme:'幕帷之间',title:'密狱',t:'情报头子请求设一处密狱，专审内奸。它能让消息变快，也能让每个人说话前先摸一摸自己的脖子。',l:{t:'设密狱。',f:{intel:15,morale:-12,food:-5},h:{ruthless:1}},r:{t:'禁私刑。',f:{intel:-12,morale:9},h:{righteous:1}}},
{id:'c111',ch:'camp',tier:'base',theme:'幕帷之间',title:'伪报',t:'你抓到一名会写敌军文书的人。他能替你造一封足以乱城的伪报，但若露馅，所有密线都会被反咬。',l:{t:'伪报乱敌。',f:{intel:13,morale:-6,food:-5},h:{}},r:{t:'不用险招。',f:{intel:-10,morale:5,military:5},h:{}}},
{id:'c112',ch:'camp',tier:'base',theme:'幕帷之间',title:'焚图',t:'几张旧地图互相矛盾，谁也说不清哪张是真的。烧掉旧图重绘，需要时间；照旧图出兵，需要运气。',l:{t:'烧图重绘。',f:{intel:11,food:-9,military:-5},h:{}},r:{t:'照图疾行。',f:{military:5,intel:-14,morale:-5},h:{ruthless:1}}},
{id:'c113',ch:'camp',tier:'base',theme:'沙场点兵',title:'血梯',t:'攻城匠造出一批轻梯，能在夜里悄悄架上城墙。它们太轻，也太容易断，像一条条通往城头的薄命。',l:{t:'夜架血梯。',f:{military:10,intel:5,morale:-12},h:{ruthless:1}},r:{t:'白日稳攻。',f:{military:-8,food:-8,morale:6},h:{}}},
{id:'c114',ch:'camp',tier:'base',theme:'沙场点兵',title:'火攻',t:'风向正好，火油也足。谋士说今夜一把火能烧开城门，医官说风从来不只听一个人的命令。',l:{t:'纵火破门。',f:{military:10,food:-8,morale:-10},h:{ruthless:1}},r:{t:'弃火围城。',f:{food:-12,intel:6,morale:5},h:{}}},
{id:'c115',ch:'camp',tier:'base',theme:'沙场点兵',title:'死士',t:'有三百人愿签死士册。签下名字，他们明日就会冲在最前；不签，他们也许能活到下一场雪。',l:{t:'收死士册。',f:{military:10,morale:-13,food:-5},h:{ruthless:1}},r:{t:'撕掉册子。',f:{military:-50,morale:10},h:{righteous:1}}},
{id:'c116',ch:'camp',tier:'base',theme:'百姓苍生',title:'赦令',t:'牢里关着一批轻罪犯，放出来能补工、补兵、补荒田。百姓害怕他们，军中也不愿和他们同锅吃饭。',l:{t:'大赦充役。',f:{food:9,military:7,morale:-12},h:{}},r:{t:'按律不赦。',f:{morale:6,military:-7,food:-5},h:{righteous:1}}},
{id:'c117',ch:'camp',tier:'base',theme:'幕帷之间',title:'疑案',t:'一夜之间，三名幕僚互相指认通敌。证词都像真的，证据也都像假的。你忽然发现，刀比真相来得快。',l:{t:'一并下狱。',f:{intel:10,morale:-15},h:{ruthless:1}},r:{t:'全数放回。',f:{intel:-13,morale:8,food:-5},h:{}}},
{id:'c118',ch:'camp',tier:'base',theme:'百姓苍生',title:'秋征令',t:'秋收刚过，粮官把账册捧到你面前。只要把今年的余粮尽数征入官仓，军中三年无忧，只是村口的哭声已经传到城楼下。',l:{t:'尽数入仓。',f:{food:18,morale:-16,intel:-5},h:{ruthless:1}},r:{t:'只征军份。',f:{food:8,morale:-5},h:{}}},
{id:'c119',ch:'camp',tier:'base',theme:'幕帷之间',title:'漕船',t:'三十艘漕船停在渡口，船上装的是邻郡赈粮。押船官说文书还没盖印，副将却说乱世里先到者先得。',l:{t:'截船入库。',f:{food:17,intel:-10,morale:-8},h:{ruthless:1}},r:{t:'借船三日。',f:{food:10,intel:-7,morale:-5},h:{}}},
{id:'c120',ch:'camp',tier:'base',theme:'百姓苍生',title:'豪仓',t:'城北豪族的暗仓终于被找到，仓门一开，陈米的气味像潮水一样涌出来。族老跪在门前，说这些粮本是留给一族活命的。',l:{t:'抄没豪仓。',f:{food:16,morale:-12,intel:5},h:{ruthless:1}},r:{t:'罚半数。',f:{food:9,morale:-5,intel:5},h:{}}},
{id:'c121',ch:'camp',tier:'base',theme:'百姓苍生',title:'屯田营',t:'副将建议把一营老兵调去开荒。粮官拍手称好，前锋却沉着脸说，少一营人，下一次冲城就少一口气。',l:{t:'设屯田营。',f:{food:14,military:-50,morale:5},h:{}},r:{t:'兵不可离阵。',f:{military:6,food:-5},h:{ruthless:1}}},
{id:'c122',ch:'camp',tier:'base',theme:'幕帷之间',title:'平粜',t:'粮价忽然暴涨，米铺门前排起长队。幕僚献策：先由官府低价收尽，再按军中规矩发卖，账面会很好看。',l:{t:'官府收尽。',f:{food:15,morale:-14,intel:-5},h:{ruthless:1}},r:{t:'按户限购。',f:{food:6,morale:5,intel:-5},h:{righteous:1}}},
{id:'c123',ch:'camp',tier:'base',theme:'沙场点兵',title:'军垦',t:'新兵训练总是跑散，老农却说这些年轻人的手很适合扶犁。若让他们白日耕田、夜里操练，粮仓会很快鼓起来。',l:{t:'军垦半月。',f:{food:13,military:-9,morale:-5},h:{}},r:{t:'照常操练。',f:{military:7,food:-5},h:{}}},
{id:'c124',ch:'camp',tier:'base',theme:'幕帷之间',title:'商仓契',t:'几家粮商愿意把私仓借给你，只要你承认他们战后的垄断契。红印还没落下，你已经听见未来的粮价在纸上发笑。',l:{t:'签下商契。',f:{food:16,morale:-9,intel:-6},h:{}},r:{t:'只借不许垄断。',f:{food:9,intel:-7},h:{}}},
{id:'c125',ch:'camp',tier:'base',theme:'百姓苍生',title:'新仓',t:'工匠说旧仓快压不住新粮，最好立刻建新仓。要木、要砖、要壮丁，也要你承认：粮太多时，保粮也会伤人。',l:{t:'强征民夫建仓。',f:{food:15,morale:-13,military:-5},h:{ruthless:1}},r:{t:'缓建小仓。',f:{food:7,morale:-5},h:{}}},
{id:'c126',ch:'camp',tier:'base',theme:'幕帷之间',title:'粮印',t:'空白粮印流入市面，有人用它换走了半条街的米。若你承认这些粮印，粮会立刻进仓；若不承认，信用就会先碎。',l:{t:'照印收粮。',f:{food:14,intel:-8,morale:-6},h:{}},r:{t:'废印追查。',f:{intel:8,food:-5,morale:5},h:{righteous:1}}},
{id:'c127',ch:'camp',tier:'base',theme:'百姓苍生',title:'麦雨',t:'连日好雨，城外麦浪一夜之间高过膝盖。百姓说这是天赐丰年，粮官却低声提醒你：天赐的东西，也可以先归军中。',l:{t:'先收军粮。',f:{food:12,morale:-9},h:{ruthless:1}},r:{t:'留足民食。',f:{food:6,morale:5},h:{righteous:1}}},

{id:'siege_1',ch:'war',tier:'rare',o:1,cm:8,theme:'攻城拔寨',title:'枯骨关',t:'斥候来报：边陲小镇守军不足五百，城墙年久失修。这是你踏上霸业的第一步——或者第一个坟墓。你的士兵们握紧了手中的刀。',l:{t:'养精蓄锐。',f:{military:5,morale:5},h:{}},r:{t:'出兵。',f:{},h:{},siege:{city:1,req:{military:40},win:{f:{food:8,morale:5},npc:'aman'},lose:{die:'end_defeat_1'}}}},
{id:'siege_2',ch:'war',tier:'rare',o:1,cm:18,theme:'攻城拔寨',title:'金沙渡',t:'第二座城是商贸重镇。城墙上站满了雇佣兵，城内粮草充足。这一仗不仅拼刀剑，还拼后勤。',l:{t:'再等等。',f:{intel:5,food:8},h:{}},r:{t:'全军压上。',f:{},h:{},siege:{city:2,req:{military:50,food:40},win:{f:{food:8,intel:5},npc:'hongsiu'},lose:{die:'end_defeat_2'}}}},
{id:'siege_3',ch:'war',tier:'rare',o:1,cm:28,theme:'攻城拔寨',title:'墨渊阁',t:'第三座城不靠武力。学宫之城的城门永远敞开，但里面的谋士设下了七层连环计。',l:{t:'从长计议。',f:{intel:8},h:{}},r:{t:'以智取之。',f:{},h:{},siege:{city:3,req:{intel:55,morale:45},win:{f:{intel:5,morale:5},npc:'qingzhao'},lose:{die:'end_defeat_3'}}}},
{id:'siege_4',ch:'war',tier:'rare',o:1,cm:38,theme:'攻城拔寨',title:'天枢殿',t:'圣城的城墙上站的不是士兵，是信徒。他们不怕死——他们以为死了会上天堂。',l:{t:'绕道而行。',f:{morale:5},h:{}},r:{t:'攻心为上。',f:{},h:{},siege:{city:4,req:{morale:55,intel:50},win:{f:{morale:5,intel:5},npc:'wuyue'},lose:{die:'end_defeat_4'}}}},
{id:'siege_5',ch:'war',tier:'rare',o:1,cm:50,theme:'攻城拔寨',title:'龙椅台',t:'最后一座城。王城的城墙高耸入云，护城河宽如江河。里面的人在等你，外面的人也在等你。这是最后一战。',l:{t:'……我还没准备好。',f:{military:5,food:8},h:{}},r:{t:'即刻攻城',f:{},h:{},siege:{city:5,req:{military:55,food:55,morale:55,intel:55},win:{f:{}},lose:{die:'end_defeat_5'}}}},

{id:'npc_aman',ch:'aman',tier:'rare',o:1,theme:'帷帐春深',title:'蛮族战俘',t:'在战俘中，一个浑身是伤的蛮族女子格外引人注目。她被五个士兵按着仍在挣扎，像一匹不肯被驯服的野马。她抬头看你，眼里没有恐惧——只有挑衅。',l:{t:'放她回草原。',f:{morale:5},h:{righteous:1}},r:{t:'留在帐中。',f:{military:5,morale:-5},h:{lust:1},fl:'aman_recruited',activate:'aman'}},
{id:'npc_hongsiu',ch:'hongsiu',tier:'rare',o:1,theme:'帷帐春深',title:'商会千金',t:'城破之日，商会大小姐主动求见。她穿着绸缎走进满是血腥的中军帐，微笑着递上一份城中所有商铺的账本。"将军，做生意吗？"',l:{t:'不需要商人。',f:{food:8},h:{righteous:1}},r:{t:'有意思。留下。',f:{intel:5},h:{lust:1},fl:'hongsiu_recruited',activate:'hongsiu'}},
{id:'npc_qingzhao',ch:'qingzhao',tier:'rare',o:1,theme:'帷帐春深',title:'才女',t:'学宫的藏书阁里，她正在从容地焚烧一批卷轴。"这些是你不该看到的东西。"她转身看你的眼神很平静，但你注意到她的手在抖。',l:{t:'让她走。',f:{intel:5,morale:5},h:{righteous:1}},r:{t:'灭火，留人。',f:{intel:5,morale:-5},h:{lust:1},fl:'qingzhao_recruited',activate:'qingzhao'}},
{id:'npc_wuyue',ch:'wuyue',tier:'rare',o:1,theme:'帷帐春深',title:'祭司',t:'圣殿最深处，巫月跪在碎裂的神像前。看到你时，她没有逃，而是站起来替你掸去铠甲上的灰尘。"新的王来了。旧神可以休息了。"',l:{t:'放她自由。',f:{morale:5},h:{righteous:1}},r:{t:'跟我走。',f:{morale:-5,intel:5},h:{lust:1},fl:'wuyue_recruited',activate:'wuyue'}},

{id:'am01',ch:'aman',tier:'base',theme:'帷帐春深',title:'驯马',t:'阿蛮偷了你最好的战马跑出了营地。斥候追了三十里才追上。她骑在马上大笑，说只是想透透气。',l:{t:'禁足三天。',f:{military:5,morale:-5},h:{aman_aff:-8,ruthless:1}},r:{t:'下次带上我。',f:{military:-5,morale:5},h:{aman_aff:12,romance:1}},npc_req:'aman'},
{id:'am02',ch:'aman',tier:'base',theme:'沙场点兵',title:'挑战',t:'阿蛮当着全军的面向你的副将发出挑战。她说草原上的女人比这里的男人更能打。副将的脸色很不好看。',l:{t:'阻止她。',f:{military:5},h:{aman_aff:-5}},r:{t:'让她打。',f:{military:-5,morale:8},h:{aman_aff:10}},npc_req:'aman'},
{id:'am03',ch:'aman',tier:'base',theme:'帷帐春深',title:'烤肉',t:'阿蛮在营火边烤了一整只羊腿，油脂滴进火里噼啪作响。她把最焦的一块塞给你，说草原上只有能挨饿的人才配吃肉。',l:{t:'拿去犒军。',f:{morale:6,food:8},h:{aman_aff:-3,righteous:1}},r:{t:'坐下同食。',f:{morale:5,food:-5},h:{aman_aff:8,romance:1}},npc_req:'aman'},
{id:'am04',ch:'aman',tier:'base',theme:'沙场点兵',title:'草原阵',t:'阿蛮用树枝在地上画出草原骑兵的包抄阵。副将皱着眉，说这种打法太散，像一群没拴住的马。',l:{t:'照军法改阵。',f:{military:6,intel:5},h:{aman_aff:-5}},r:{t:'试她的阵。',f:{military:9,intel:-7},h:{aman_aff:8}},npc_req:'aman'},
{id:'am05',ch:'aman',tier:'base',theme:'帷帐春深',title:'伤疤',t:'换药时，阿蛮背上的旧疤一条压着一条。她没有遮，只问你中原人是不是连伤口都要讲礼数。',l:{t:'叫医女来。',f:{morale:5},h:{aman_aff:-4}},r:{t:'亲手上药。',f:{morale:5},h:{aman_aff:10,romance:1,lust:1}},npc_req:'aman'},
{id:'am06',ch:'aman',tier:'base',theme:'百姓苍生',title:'抢粮',t:'阿蛮的部曲和城中粮商起了冲突。她说那商人短斤少两，粮商说蛮女拔刀吓人。围观百姓越聚越多。',l:{t:'罚阿蛮。',f:{morale:7,military:-5},h:{aman_aff:-8,righteous:1}},r:{t:'查粮商账。',f:{food:7,intel:5,morale:-5},h:{aman_aff:7}},npc_req:'aman'},
{id:'am07',ch:'aman',tier:'deep',mp:2,ca:{aman_aff:45},theme:'帷帐春深',title:'归路',t:'夜里，阿蛮坐在城墙上望北。她说草原的风会记住每个人的名字，而这里的墙太高，连风都进不来。',l:{t:'你已无归路。',f:{morale:-5},h:{aman_aff:-6,ruthless:1}},r:{t:'想家就说。',f:{morale:5,intel:5},h:{aman_aff:12,romance:1}},npc_req:'aman'},
{id:'am08',ch:'aman',tier:'deep',mp:2,o:1,ca:{aman_aff:55},theme:'沙场点兵',title:'血誓',t:'阿蛮把短刀递给你，刀刃上还带着热血。她说草原人结盟不靠纸，靠伤口。营帐里所有人都屏住了呼吸。',l:{t:'割掌立誓。',f:{military:5,morale:5},h:{aman_aff:12},a:['am08b']},r:{t:'收刀不割。',f:{intel:5,morale:-5},h:{aman_aff:-8}},npc_req:'aman'},
{id:'am08b',ch:'aman',tier:'deep',mp:2,o:1,ca:{aman_aff:55},theme:'帷帐春深',title:'同骑',t:'血誓之后，阿蛮把你拉上马背。风从耳边割过，她笑得很大声，像要把整座中原都甩在身后。',l:{t:'勒马回营。',f:{military:5,intel:5},h:{aman_aff:-3}},r:{t:'任她疾驰。',f:{military:6,morale:6},h:{aman_aff:10,romance:1,lust:1}},npc_req:'aman'},
{id:'am09',ch:'aman',tier:'rare',o:1,ca:{aman_aff:65},theme:'帷帐春深',title:'缰绳',t:'阿蛮把一根旧缰绳丢到你案上。"草原上，谁能抓住我的马，谁才有资格叫我留下。"她的眼睛亮得像刀背上的月。',l:{t:'亲手套缰。',f:{military:8,morale:5},h:{aman_aff:12},fl:'aman_sub'},r:{t:'让她套你。',f:{military:-5,morale:7},h:{aman_aff:14,romance:1,lust:1},fl:'aman_fall'},npc_req:'aman'},
{id:'am10',ch:'aman',tier:'deep',mp:2,ca:{aman_aff:70},theme:'沙场点兵',title:'先锋',t:'攻城前夜，阿蛮披甲来请战。她不问你准不准，只把马鞭放在案上，像把自己的命也放了上来。',l:{t:'让她压阵。',f:{military:5,intel:5},h:{aman_aff:-4}},r:{t:'命她先登。',f:{military:6,morale:-5},h:{aman_aff:8,ruthless:1}},npc_req:'aman'},
{id:'am11',ch:'aman',tier:'base',theme:'沙场点兵',title:'角弓',t:'阿蛮嫌中原弓太软，拿自己的角弓射穿了两层皮甲。弓营士兵围上来，又佩服又不服。',l:{t:'命她教弓。',f:{military:7,morale:5},h:{aman_aff:6}},r:{t:'别乱军制。',f:{intel:5,military:5},h:{aman_aff:-5}},npc_req:'aman'},
{id:'am12',ch:'aman',tier:'base',theme:'百姓苍生',title:'猎鹿',t:'阿蛮带回一头鹿，血还热着。她想把鹿肉分给巡营士兵，伙头军却说军粮配给不能乱。',l:{t:'归入军粮。',f:{food:8,morale:-5},h:{aman_aff:-4}},r:{t:'今晚分肉。',f:{morale:7,food:8},h:{aman_aff:7}},npc_req:'aman'},
{id:'am13',ch:'aman',tier:'base',theme:'帷帐春深',title:'发辫',t:'阿蛮坐在帐门口编发，嘴里叼着一截皮绳。她说草原女子只让亲近的人碰头发，说完又把皮绳扔到你怀里。',l:{t:'让侍女来。',f:{intel:5},h:{aman_aff:-6}},r:{t:'替她系上。',f:{morale:5},h:{aman_aff:10,romance:1}},npc_req:'aman'},
{id:'am14',ch:'aman',tier:'deep',mp:2,ca:{aman_aff:50},theme:'幕帷之间',title:'北信',t:'北边送来一封草原文字的信。阿蛮看完后把信揉成一团，说不过是旧人想让她回去。火盆就在你脚边。',l:{t:'烧掉那信。',f:{military:5,morale:-5},h:{aman_aff:8,ruthless:1}},r:{t:'让她回信。',f:{intel:6,morale:5},h:{aman_aff:10,righteous:1}},npc_req:'aman'},
{id:'am15',ch:'aman',tier:'deep',mp:2,ca:{aman_aff:60},theme:'沙场点兵',title:'狼阵',t:'阿蛮提出用小队撕开敌阵，像狼咬开羊群。你的副将觉得太险，却也承认没人比她更懂这种打法。',l:{t:'只作佯攻。',f:{intel:6,military:5},h:{aman_aff:-3}},r:{t:'让狼先咬。',f:{military:5,morale:-5},h:{aman_aff:8,ruthless:1}},npc_req:'aman'},

{id:'hs01',ch:'hongsiu',tier:'base',theme:'帷帐春深',title:'算盘',t:'红袖坐在粮仓门口拨算盘，珠子响得比雨还密。她说你打下一座城的速度，远不如花掉一座城的速度。',l:{t:'让她闭嘴。',f:{military:5,food:-5},h:{hongsiu_aff:-7,ruthless:1}},r:{t:'把账交给她。',f:{food:9,intel:5},h:{hongsiu_aff:8}},npc_req:'hongsiu'},
{id:'hs02',ch:'hongsiu',tier:'base',theme:'幕帷之间',title:'商路',t:'红袖指着地图上一条细线，说这不是路，是会流动的粮仓。只要给她三十名护卫，她能让银子自己走进城门。',l:{t:'护卫归军。',f:{military:5,food:-5},h:{hongsiu_aff:-5}},r:{t:'拨护卫给她。',f:{food:8,military:-50,intel:5},h:{hongsiu_aff:8}},npc_req:'hongsiu'},
{id:'hs03',ch:'hongsiu',tier:'base',theme:'帷帐春深',title:'胭脂',t:'红袖送来一盒胭脂，说是新开商路上的样货。盒盖一启，香气漫过案上的军令。她笑问你，颜色好不好看。',l:{t:'赏给侍女。',f:{morale:5},h:{hongsiu_aff:-6}},r:{t:'替她试色。',f:{intel:-5},h:{hongsiu_aff:10,romance:1,lust:1}},npc_req:'hongsiu'},
{id:'hs04',ch:'hongsiu',tier:'base',theme:'百姓苍生',title:'粥棚',t:'城外流民越聚越多，红袖提议开粥棚，但要在棚前挂商会旗。她说善名也是本钱，不能白撒。',l:{t:'挂军旗。',f:{morale:8,food:-5},h:{hongsiu_aff:-4,righteous:1}},r:{t:'让她挂。',f:{morale:6,food:-5,intel:5},h:{hongsiu_aff:8}},npc_req:'hongsiu'},
{id:'hs05',ch:'hongsiu',tier:'base',theme:'幕帷之间',title:'债契',t:'几个小商人跪在府前，求你废掉红袖新订的债契。红袖站在帘后，没有露面，只让人送来一盏温茶。',l:{t:'废契安民。',f:{morale:8,food:-6},h:{hongsiu_aff:-10,righteous:1}},r:{t:'契就是契。',f:{food:8,morale:-6},h:{hongsiu_aff:8,ruthless:1}},npc_req:'hongsiu'},
{id:'hs06',ch:'hongsiu',tier:'base',theme:'帷帐春深',title:'雨账',t:'雨下了一夜，红袖抱着账册来找你。她裙角湿透，却先问你要不要趁雨涨价收购麻布。',l:{t:'只谈军务。',f:{intel:5},h:{hongsiu_aff:-4}},r:{t:'先给她披衣。',f:{morale:5,food:-5},h:{hongsiu_aff:9,romance:1}},npc_req:'hongsiu'},
{id:'hs07',ch:'hongsiu',tier:'deep',mp:2,ca:{hongsiu_aff:45},theme:'幕帷之间',title:'暗账',t:'红袖把一册黑账推到你面前。里面记着三座城的私盐、私铁和私兵。她说，这些人买忠诚，也卖忠诚。',l:{t:'全部抄没。',f:{food:8,intel:5,morale:-10},h:{ruthless:1,hongsiu_aff:-3}},r:{t:'留着慢慢用。',f:{food:8,intel:5,morale:-5},h:{hongsiu_aff:8}},npc_req:'hongsiu'},
{id:'hs08',ch:'hongsiu',tier:'deep',mp:2,o:1,ca:{hongsiu_aff:55},theme:'帷帐春深',title:'玉簪',t:'红袖摘下玉簪抵住你的喉结，力道轻得像玩笑。她说商人最怕押错宝，而她已经把自己押上来了。',l:{t:'握住簪尖。',f:{intel:5,morale:5},h:{hongsiu_aff:10},a:['hs08b']},r:{t:'吻她手腕。',f:{intel:-5,morale:5},h:{hongsiu_aff:12,romance:1,lust:1},a:['hs08b']},npc_req:'hongsiu'},
{id:'hs08b',ch:'hongsiu',tier:'deep',mp:2,o:1,ca:{hongsiu_aff:55},theme:'幕帷之间',title:'押宝',t:'第二天，红袖替你拿下一整条粮船。她没有邀功，只把湿漉漉的账单贴在你案上，墨迹像一场刚退的潮。',l:{t:'按军功赏她。',f:{food:8,intel:5},h:{hongsiu_aff:5}},r:{t:'把库印给她。',f:{food:8,morale:-5},h:{hongsiu_aff:10}},npc_req:'hongsiu'},
{id:'hs09',ch:'hongsiu',tier:'rare',o:1,ca:{hongsiu_aff:65},theme:'帷帐春深',title:'金屋',t:'红袖问你，若天下是一笔生意，你愿意让她做掌柜，还是做债主。她笑意温软，眼底却没有半分玩笑。',l:{t:'共掌天下账。',f:{food:8,intel:5},h:{hongsiu_aff:12},fl:'hongsiu_sub'},r:{t:'我欠你一生。',f:{food:-5,morale:6},h:{hongsiu_aff:14,romance:1,lust:1},fl:'hongsiu_fall'},npc_req:'hongsiu'},
{id:'hs10',ch:'hongsiu',tier:'deep',mp:2,ca:{hongsiu_aff:70},theme:'百姓苍生',title:'粮价',t:'丰收后粮价暴跌，农户哭倒在市口。红袖说现在收粮最便宜，过了冬天，所有人都会感谢你的冷血。',l:{t:'压价收尽。',f:{food:8,morale:-10},h:{ruthless:1,hongsiu_aff:6}},r:{t:'定保护价。',f:{food:8,morale:5},h:{righteous:1,hongsiu_aff:4}},npc_req:'hongsiu'},
{id:'hs11',ch:'hongsiu',tier:'base',theme:'幕帷之间',title:'银票',t:'红袖拿出一叠新制银票，纸薄如蝉翼。她说兵马未动，信用先行；副将只问纸能不能挡箭。',l:{t:'先小范围用。',f:{food:8,intel:5},h:{hongsiu_aff:6}},r:{t:'军中不用纸。',f:{military:5,food:-5},h:{hongsiu_aff:-5}},npc_req:'hongsiu'},
{id:'hs12',ch:'hongsiu',tier:'base',theme:'帷帐春深',title:'耳坠',t:'红袖少了一只耳坠，偏说掉在你帐里。她弯腰去找，袖口扫过案上的军图，香气比墨色更先靠近你。',l:{t:'叫人来找。',f:{intel:5},h:{hongsiu_aff:-5}},r:{t:'亲自替她找。',f:{morale:5,intel:-7},h:{hongsiu_aff:10,romance:1,lust:1}},npc_req:'hongsiu'},
{id:'hs13',ch:'hongsiu',tier:'base',theme:'百姓苍生',title:'米铺',t:'红袖建议把官粮拆成小袋卖，价低但限量。百姓能买到米，豪商却会少赚一大笔。',l:{t:'照她说办。',f:{morale:8,food:-5},h:{hongsiu_aff:7,righteous:1}},r:{t:'别惹豪商。',f:{food:7,morale:-5,intel:-5},h:{hongsiu_aff:-5}},npc_req:'hongsiu'},
{id:'hs14',ch:'hongsiu',tier:'deep',mp:2,ca:{hongsiu_aff:50},theme:'幕帷之间',title:'商盟',t:'三地商会愿意结盟，但要你承认他们的路引特权。红袖说鱼要入网，总得先给一点水。',l:{t:'只给短引。',f:{food:7,intel:6},h:{hongsiu_aff:5}},r:{t:'放开路引。',f:{food:8,morale:-6},h:{hongsiu_aff:9}},npc_req:'hongsiu'},
{id:'hs15',ch:'hongsiu',tier:'deep',mp:2,ca:{hongsiu_aff:60},theme:'帷帐春深',title:'红账',t:'红袖把一本红封账册压在枕边，说里面记的不是银子，是你欠她的每一次偏心。她笑着，却不肯让你翻。',l:{t:'夺来看账。',f:{intel:6,morale:-5},h:{hongsiu_aff:-7,ruthless:1}},r:{t:'欠着便是。',f:{morale:5,food:-5},h:{hongsiu_aff:12,romance:1}},npc_req:'hongsiu'},

{id:'qz01',ch:'qingzhao',tier:'base',theme:'幕帷之间',title:'残卷',t:'清越把半卷兵书放在灯下修补。你靠近时，她立刻合上书页，说残缺的东西看多了，人也会变得不完整。',l:{t:'命她交出。',f:{intel:8,morale:-5},h:{qingzhao_aff:-7,ruthless:1}},r:{t:'陪她补完。',f:{intel:5,food:-5},h:{qingzhao_aff:8}},npc_req:'qingzhao'},
{id:'qz02',ch:'qingzhao',tier:'base',theme:'帷帐春深',title:'冷茶',t:'清越给你倒茶，茶水已经凉了。她说热茶容易让人松懈，凉茶才适合读敌人的信。',l:{t:'换热的来。',f:{morale:5},h:{qingzhao_aff:-5}},r:{t:'喝下冷茶。',f:{intel:5,morale:-5},h:{qingzhao_aff:8}},npc_req:'qingzhao'},
{id:'qz03',ch:'qingzhao',tier:'base',theme:'幕帷之间',title:'译信',t:'截获的密信用了学宫古文，帐中无人读得通。清越只看了一眼，就把其中三处错字圈了出来。',l:{t:'让幕僚复核。',f:{intel:5,food:-5},h:{qingzhao_aff:-3}},r:{t:'信她一次。',f:{intel:9,morale:-5},h:{qingzhao_aff:8}},npc_req:'qingzhao'},
{id:'qz04',ch:'qingzhao',tier:'base',theme:'百姓苍生',title:'讲学',t:'清越想在城中开一日讲学，教孩子识字。副将说这时候该练刀，不该练笔。孩子们在学舍外探头看她。',l:{t:'停课练兵。',f:{military:6,morale:-5},h:{qingzhao_aff:-6}},r:{t:'准她讲学。',f:{morale:8,intel:5,food:-5},h:{qingzhao_aff:8,righteous:1}},npc_req:'qingzhao'},
{id:'qz05',ch:'qingzhao',tier:'base',theme:'帷帐春深',title:'墨香',t:'你在书案旁睡着，醒来时肩上多了一件薄披风。清越正在磨墨，眼睛没有看你，耳尖却红得很安静。',l:{t:'装作不知。',f:{intel:5},h:{qingzhao_aff:-2}},r:{t:'替她挽袖。',f:{morale:5},h:{qingzhao_aff:10,romance:1}},npc_req:'qingzhao'},
{id:'qz06',ch:'qingzhao',tier:'base',theme:'幕帷之间',title:'旧国',t:'有人在墙上写下清越旧国的年号。士兵要把那面墙砸了，她却站在雨里看了很久。',l:{t:'砸墙禁言。',f:{intel:5,morale:-6},h:{ruthless:1,qingzhao_aff:-8}},r:{t:'洗墙留人。',f:{morale:5,intel:5},h:{qingzhao_aff:8,righteous:1}},npc_req:'qingzhao'},
{id:'qz07',ch:'qingzhao',tier:'deep',mp:2,ca:{qingzhao_aff:45},theme:'幕帷之间',title:'错字',t:'清越指出军令里一个错字。若照错字行军，粮队会绕进敌军伏地。写令的文吏是你父亲留下的人。',l:{t:'当众问罪。',f:{intel:5,morale:-6},h:{ruthless:1}},r:{t:'私下换令。',f:{intel:8,morale:5},h:{qingzhao_aff:6}},npc_req:'qingzhao'},
{id:'qz08',ch:'qingzhao',tier:'deep',mp:2,o:1,ca:{qingzhao_aff:55},theme:'帷帐春深',title:'半阙',t:'清越写了一首未完的词，最后一句空着。她把笔递给你，说若你填得不好，她会烧掉整张纸。',l:{t:'写天下二字。',f:{intel:8,morale:-5},h:{qingzhao_aff:8},a:['qz08b']},r:{t:'写她的名字。',f:{intel:-7,morale:6},h:{qingzhao_aff:12,romance:1,lust:1},a:['qz08b']},npc_req:'qingzhao'},
{id:'qz08b',ch:'qingzhao',tier:'deep',mp:2,o:1,ca:{qingzhao_aff:55},theme:'幕帷之间',title:'焚信',t:'她把一封旧国密信投入火中。纸边卷起时，你看见信末有她亲手画的城防图，也看见她指尖微微发抖。',l:{t:'问她罪。',f:{intel:5,morale:-8},h:{qingzhao_aff:-6,ruthless:1}},r:{t:'替她添火。',f:{intel:6,morale:5},h:{qingzhao_aff:12}},npc_req:'qingzhao'},
{id:'qz09',ch:'qingzhao',tier:'rare',o:1,ca:{qingzhao_aff:65},theme:'帷帐春深',title:'折笔',t:'清越把一支旧笔横在案上。笔杆刻着旧国年号。她问你，是要她折了这支笔，还是替你继续写一封永远寄不出的信。',l:{t:'折笔入我帐。',f:{intel:5,morale:5},h:{qingzhao_aff:12},fl:'qingzhao_sub'},r:{t:'写完那封信。',f:{intel:6,morale:-5},h:{qingzhao_aff:14,romance:1,lust:1},fl:'qingzhao_fall'},npc_req:'qingzhao'},
{id:'qz10',ch:'qingzhao',tier:'deep',mp:2,ca:{qingzhao_aff:70},theme:'幕帷之间',title:'七策',t:'大战前，清越呈上七条策论。前六条稳妥，第七条狠毒到连副将都沉默。她说，最好的计策总要有人恨。',l:{t:'用第七策。',f:{intel:5,morale:-8,military:5},h:{ruthless:1,qingzhao_aff:5}},r:{t:'用前三策。',f:{intel:7,morale:5},h:{righteous:1,qingzhao_aff:4}},npc_req:'qingzhao'},
{id:'qz11',ch:'qingzhao',tier:'base',theme:'幕帷之间',title:'棋局',t:'清越在沙盘旁摆了一局棋，黑白子夹着你的骑兵路线。她说若你能看懂，就少死三百人。',l:{t:'照棋行军。',f:{intel:8,military:5},h:{qingzhao_aff:7}},r:{t:'棋不是战场。',f:{military:5,intel:-7},h:{qingzhao_aff:-5}},npc_req:'qingzhao'},
{id:'qz12',ch:'qingzhao',tier:'base',theme:'百姓苍生',title:'童蒙',t:'几个孩子背错了清越教的字，被军士笑得脸红。她放下书卷，问你天下若只会握刀，谁来写太平。',l:{t:'让孩子散了。',f:{military:5,morale:-5},h:{qingzhao_aff:-5}},r:{t:'拨粮办学。',f:{morale:8,intel:5,food:-6},h:{qingzhao_aff:8,righteous:1}},npc_req:'qingzhao'},
{id:'qz13',ch:'qingzhao',tier:'base',theme:'帷帐春深',title:'灯谜',t:'清越在灯下写了一个谜。谜面是你的名字，谜底却空着。她说猜错也无妨，只是不许装作看不见。',l:{t:'收进袖中。',f:{intel:5},h:{qingzhao_aff:6}},r:{t:'当场猜她。',f:{morale:5,intel:-7},h:{qingzhao_aff:10,romance:1}},npc_req:'qingzhao'},
{id:'qz14',ch:'qingzhao',tier:'deep',mp:2,ca:{qingzhao_aff:50},theme:'幕帷之间',title:'反间',t:'清越看出敌信里的破绽，建议反写一封送回去。她的字迹太像旧国文书，像到让帐中人都不敢说话。',l:{t:'让她执笔。',f:{intel:5,morale:-5},h:{qingzhao_aff:7}},r:{t:'换人仿写。',f:{intel:6,morale:5},h:{qingzhao_aff:-4}},npc_req:'qingzhao'},
{id:'qz15',ch:'qingzhao',tier:'deep',mp:2,ca:{qingzhao_aff:60},theme:'帷帐春深',title:'雪笺',t:'雪夜里，清越把一张素笺压在你掌心。纸上只有一句：若你败了，我该替谁守这座城？',l:{t:'替天下守。',f:{morale:5,intel:6},h:{qingzhao_aff:6}},r:{t:'替我守。',f:{morale:5,intel:5},h:{qingzhao_aff:12,romance:1}},npc_req:'qingzhao'},

{id:'wy01',ch:'wuyue',tier:'base',theme:'帷帐春深',title:'银铃',t:'巫月走路时，腕上的银铃几乎不响。她说真正的祭司要学会让神明先听见脚步，而不是让人听见。',l:{t:'别装神秘。',f:{intel:5},h:{wuyue_aff:-6}},r:{t:'听她走近。',f:{morale:5,intel:5},h:{wuyue_aff:8}},npc_req:'wuyue'},
{id:'wy02',ch:'wuyue',tier:'base',theme:'百姓苍生',title:'香灰',t:'百姓排队来求巫月赐香灰。医官气得脸色铁青，说药才救命。巫月只低声问你，人若不信能活，药也会苦。',l:{t:'禁卖香灰。',f:{intel:5,morale:-6},h:{wuyue_aff:-7}},r:{t:'药和香都给。',f:{morale:8,food:-5,intel:5},h:{wuyue_aff:8,righteous:1}},npc_req:'wuyue'},
{id:'wy03',ch:'wuyue',tier:'base',theme:'幕帷之间',title:'梦兆',t:'巫月说她梦见王城的门向你打开，门后却没有人。幕僚嗤笑一声，她看向那人，笑得很温柔。',l:{t:'梦不治军。',f:{intel:6,morale:-5},h:{wuyue_aff:-5}},r:{t:'记入军档。',f:{morale:6,intel:5},h:{wuyue_aff:7}},npc_req:'wuyue'},
{id:'wy04',ch:'wuyue',tier:'base',theme:'帷帐春深',title:'月下',t:'你在殿阶上找到巫月。她赤脚踩着冷石，正把碎掉的神像一点点拼回去。月光落在她发间，像一层很薄的霜。',l:{t:'叫她回帐。',f:{morale:5},h:{wuyue_aff:-3}},r:{t:'陪她拼完。',f:{morale:5,intel:5},h:{wuyue_aff:10,romance:1}},npc_req:'wuyue'},
{id:'wy05',ch:'wuyue',tier:'base',theme:'百姓苍生',title:'赦罪',t:'一个杀过人的逃兵跪在巫月脚边求赦。她把手放在他头顶，说罪不会消失，只会换个人背。',l:{t:'拖出去斩。',f:{military:6,morale:-5},h:{ruthless:1,wuyue_aff:-5}},r:{t:'罚入苦役。',f:{military:5,morale:5},h:{righteous:1,wuyue_aff:7}},npc_req:'wuyue'},
{id:'wy06',ch:'wuyue',tier:'base',theme:'幕帷之间',title:'圣谕',t:'有人伪造圣谕，煽动百姓拒交军粮。巫月看完那张纸，轻轻笑了一下，说伪造的人很懂恐惧。',l:{t:'公开烧谕。',f:{morale:-5,intel:6},h:{ruthless:1}},r:{t:'让她辨伪。',f:{morale:6,intel:7,food:-5},h:{wuyue_aff:8}},npc_req:'wuyue'},
{id:'wy07',ch:'wuyue',tier:'deep',mp:2,ca:{wuyue_aff:45},theme:'帷帐春深',title:'旧神',t:'巫月告诉你，旧神从不保佑胜者，只保佑愿意付出代价的人。她说这话时，指尖停在你的心口。',l:{t:'我不信神。',f:{intel:6,morale:-5},h:{wuyue_aff:-5}},r:{t:'代价是什么。',f:{morale:7,intel:5},h:{wuyue_aff:10,romance:1}},npc_req:'wuyue'},
{id:'wy08',ch:'wuyue',tier:'deep',mp:2,o:1,ca:{wuyue_aff:55},theme:'百姓苍生',title:'白花',t:'城中死者太多，巫月让人把白花摆满街口。士兵嫌晦气，百姓却第一次敢走出门，为亲人点一盏灯。',l:{t:'撤掉白花。',f:{military:5,morale:-7},h:{wuyue_aff:-5}},r:{t:'准她设祭。',f:{morale:5,food:-5},h:{wuyue_aff:9,righteous:1},a:['wy08b']},npc_req:'wuyue'},
{id:'wy08b',ch:'wuyue',tier:'deep',mp:2,o:1,ca:{wuyue_aff:55},theme:'帷帐春深',title:'祭灯',t:'夜里万灯如河。巫月把一盏小灯放进你手里，说每一场胜仗都要有人替死人记账。她的手很凉。',l:{t:'只记胜者。',f:{military:5,morale:-5},h:{ruthless:1,wuyue_aff:-3}},r:{t:'同她记名。',f:{morale:8,intel:5},h:{wuyue_aff:12,romance:1}},npc_req:'wuyue'},
{id:'wy09',ch:'wuyue',tier:'rare',o:1,ca:{wuyue_aff:65},theme:'帷帐春深',title:'破戒',t:'巫月摘下银冠，长发落在肩上。她问你，是要她从神坛走下来，还是要你走上祭坛。殿中烛火一瞬间全都低了下去。',l:{t:'下来，做凡人。',f:{morale:5,intel:5},h:{wuyue_aff:12},fl:'wuyue_sub'},r:{t:'带我上祭坛。',f:{morale:8,intel:-7},h:{wuyue_aff:14,romance:1,lust:1},fl:'wuyue_fall'},npc_req:'wuyue'},
{id:'wy10',ch:'wuyue',tier:'deep',mp:2,ca:{wuyue_aff:70},theme:'幕帷之间',title:'圣火',t:'攻城前，巫月请你点燃圣火。她说火能让信徒安静，也能让敌人害怕，只是火从不分清谁该被烧。',l:{t:'烧给敌人看。',f:{morale:5,intel:-7},h:{ruthless:1,wuyue_aff:5}},r:{t:'只照自己人。',f:{morale:8,intel:5},h:{righteous:1,wuyue_aff:4}},npc_req:'wuyue'},
{id:'wy11',ch:'wuyue',tier:'base',theme:'百姓苍生',title:'净水',t:'井边有人说喝了巫月祝过的水，烧就退了。医官想把水桶搬走，百姓却护着桶不肯让。',l:{t:'交给医官。',f:{intel:6,morale:-5},h:{wuyue_aff:-5}},r:{t:'让她祝水。',f:{morale:8,intel:-5},h:{wuyue_aff:7}},npc_req:'wuyue'},
{id:'wy12',ch:'wuyue',tier:'base',theme:'帷帐春深',title:'银冠',t:'巫月让你替她擦银冠。冠上细纹像月下河道，你擦到最后，才发现她一直安静地看着你的手。',l:{t:'交还给她。',f:{intel:5},h:{wuyue_aff:5}},r:{t:'替她戴上。',f:{morale:5},h:{wuyue_aff:10,romance:1}},npc_req:'wuyue'},
{id:'wy13',ch:'wuyue',tier:'base',theme:'幕帷之间',title:'香案',t:'军帐角落多了一只小香案，士兵出征前都去摸一下案沿。副将说这会让他们信命，不信刀。',l:{t:'撤掉香案。',f:{military:5,morale:-6},h:{wuyue_aff:-6}},r:{t:'留着无妨。',f:{morale:7,military:5},h:{wuyue_aff:7}},npc_req:'wuyue'},
{id:'wy14',ch:'wuyue',tier:'deep',mp:2,ca:{wuyue_aff:50},theme:'百姓苍生',title:'病童',t:'一个病童抓着巫月的衣角不放。她跪在泥地里唱古老的祷词，医官在旁边等你一句准话。',l:{t:'先用猛药。',f:{intel:6,morale:-5},h:{wuyue_aff:-4}},r:{t:'药后祷告。',f:{morale:9,food:-5,intel:5},h:{wuyue_aff:9,righteous:1}},npc_req:'wuyue'},
{id:'wy15',ch:'wuyue',tier:'deep',mp:2,ca:{wuyue_aff:60},theme:'帷帐春深',title:'月痕',t:'巫月腕上有一道淡淡旧痕，她说那是第一次听见神明说话时留下的。你问疼不疼，她反问你怕不怕。',l:{t:'神明可疑。',f:{intel:7,morale:-5},h:{wuyue_aff:-5}},r:{t:'我只怕你疼。',f:{morale:6},h:{wuyue_aff:12,romance:1,lust:1}},npc_req:'wuyue'},

{id:'hc01',ch:'camp',tier:'base',theme:'帷帐春深',title:'座次',t:'阿蛮和红袖为了谁坐在你身边吵了起来。阿蛮的匕首拍在案上，红袖的账本也拍在案上。酒盏跳了一下。',l:{t:'让阿蛮坐。',f:{military:5,food:-5},h:{aman_aff:8,hongsiu_aff:-10}},r:{t:'让红袖坐。',f:{military:-5,food:8},h:{hongsiu_aff:8,aman_aff:-10}},npc_req:'aman',ca:{aman_aff:50,hongsiu_aff:50}},
{id:'hc02',ch:'camp',tier:'base',theme:'帷帐春深',title:'书与铃',t:'清越嫌巫月的银铃扰人，巫月说她的书页翻得像招魂。两个人隔着一盏灯微笑，屋里冷得像入冬。',l:{t:'听清越讲。',f:{intel:6,morale:-5},h:{qingzhao_aff:8,wuyue_aff:-10}},r:{t:'听巫月说。',f:{morale:6,intel:-7},h:{wuyue_aff:8,qingzhao_aff:-10}},npc_req:'qingzhao',ca:{qingzhao_aff:50,wuyue_aff:50}},
{id:'hc03',ch:'camp',tier:'base',theme:'帷帐春深',title:'账中人',t:'红袖把清越的用纸用墨全列进账册。清越看完，只在末尾添了一行：红袖姑娘昨日胭脂三钱。',l:{t:'账要清楚。',f:{food:10,intel:-7},h:{hongsiu_aff:8,qingzhao_aff:-8}},r:{t:'诗也要清楚。',f:{intel:6,food:-5},h:{qingzhao_aff:8,hongsiu_aff:-8}},npc_req:'hongsiu',ca:{hongsiu_aff:50,qingzhao_aff:50}},
{id:'hc04',ch:'camp',tier:'base',theme:'帷帐春深',title:'刀与香',t:'阿蛮说巫月的香气会让士兵手软。巫月抬眼看她，说刀锋太亮的人，夜里反而睡不安稳。',l:{t:'随阿蛮练刀。',f:{military:7,morale:-5},h:{aman_aff:8,wuyue_aff:-8}},r:{t:'陪巫月上香。',f:{morale:7,military:-5},h:{wuyue_aff:8,aman_aff:-8}},npc_req:'aman',ca:{aman_aff:50,wuyue_aff:50}},
{id:'hc05',ch:'camp',tier:'base',theme:'帷帐春深',title:'马与书',t:'阿蛮把清越的书卷垫在马鞍下，说纸比草软。清越看着那卷书，声音轻得像雪落在刀上。',l:{t:'罚阿蛮赔书。',f:{intel:6,military:-5},h:{qingzhao_aff:8,aman_aff:-8}},r:{t:'让清越别气。',f:{military:6,intel:-7},h:{aman_aff:8,qingzhao_aff:-8}},npc_req:'aman',ca:{aman_aff:50,qingzhao_aff:50}},
{id:'hc06',ch:'camp',tier:'base',theme:'帷帐春深',title:'账与香',t:'红袖嫌巫月的祭礼花费太高，巫月说有些安宁不能按斤两算。两人都笑着，账房却没人敢出声。',l:{t:'先看账本。',f:{food:7,morale:-5},h:{hongsiu_aff:8,wuyue_aff:-8}},r:{t:'先问民心。',f:{morale:7,food:-5},h:{wuyue_aff:8,hongsiu_aff:-8}},npc_req:'hongsiu',ca:{hongsiu_aff:50,wuyue_aff:50}},
{id:'hc07',ch:'camp',tier:'deep',mp:2,ca:{aman_aff:55,hongsiu_aff:55,qingzhao_aff:55},theme:'帷帐春深',title:'三杯酒',t:'阿蛮要你喝烈酒，红袖要你喝暖酒，清越递来的却是一盏清茶。三只杯子并排放着，像三道不同的军令。',l:{t:'饮烈酒。',f:{military:6,food:-5},h:{aman_aff:8,hongsiu_aff:-5,qingzhao_aff:-5}},r:{t:'饮清茶。',f:{intel:6,morale:5},h:{qingzhao_aff:8,aman_aff:-5,hongsiu_aff:-5}},npc_req:'aman'},
{id:'hc08',ch:'camp',tier:'deep',mp:2,ca:{hongsiu_aff:55,qingzhao_aff:55,wuyue_aff:55},theme:'帷帐春深',title:'三盏灯',t:'红袖点的是金灯，清越点的是书灯，巫月点的是祭灯。你站在三色光里，忽然觉得影子被分成了三份。',l:{t:'留金灯。',f:{food:7,intel:-5},h:{hongsiu_aff:8,qingzhao_aff:-5,wuyue_aff:-5}},r:{t:'留祭灯。',f:{morale:7,food:-5},h:{wuyue_aff:8,hongsiu_aff:-5,qingzhao_aff:-5}},npc_req:'hongsiu'},

{id:'w_mil_lo',ch:'camp',tier:'base',cs:{military:[0,25]},theme:'沙场点兵',title:'空营',t:'夜间点卯，兵营里的火堆越来越稀疏。逃兵的数量已经超过了你愿意承认的数字。',l:{t:'严惩逃兵。',f:{military:8,morale:-10},h:{ruthless:1}},r:{t:'加发军饷。',f:{military:5,food:-5},h:{righteous:1}}},
{id:'w_mil_lo2',ch:'camp',tier:'base',cs:{military:[0,25]},theme:'沙场点兵',title:'空枪架',t:'武库里的枪架空了三排。管库兵低着头，说不是丢了，是折了，断在训练场、逃亡路和上一场小败里。',l:{t:'重铸旧铁。',f:{military:8,food:-5},h:{}},r:{t:'缩编成精兵。',f:{military:6,morale:-5,intel:5},h:{}}},
{id:'w_mil_lo3',ch:'camp',tier:'base',cs:{military:[0,25]},theme:'沙场点兵',title:'弱旅',t:'巡营时，你看见两个士兵共用一杆长枪。枪头松了，木杆也裂着，他们仍站得笔直，像怕一弯腰就会散。',l:{t:'征兵补营。',f:{military:9,food:-6,morale:-5},h:{}},r:{t:'厚赏老兵。',f:{military:6,food:-5,morale:5},h:{righteous:1}}},
{id:'w_mil_hi',ch:'camp',tier:'base',cs:{military:[75,100]},theme:'沙场点兵',title:'满营甲光',t:'兵营扩到城外三里，夜里甲片反光像一片冷湖。将领们说话越来越大声，连幕僚进帐都要先看他们脸色。',l:{t:'削将领亲兵。',f:{military:-50,intel:5,morale:5},h:{ruthless:1}},r:{t:'继续扩军。',f:{military:5,food:-5,morale:-5},h:{}}},
{id:'w_mil_hi2',ch:'camp',tier:'base',cs:{military:[75,100]},theme:'幕帷之间',title:'将旗',t:'副将的旗帜在校场上比你的帅旗还显眼。没人明说什么，但新兵们喊错号令时，老兵没有纠正。',l:{t:'撤他的旗。',f:{military:-8,intel:5},h:{ruthless:1}},r:{t:'赐他金鼓。',f:{military:5,morale:5,intel:-8},h:{}}},
{id:'w_mil_hi3',ch:'camp',tier:'base',cs:{military:[75,100]},theme:'沙场点兵',title:'私兵',t:'几名将领开始私下招募亲随，名册不入军档。问起来，他们说只是给你多养几把刀。',l:{t:'收回名册。',f:{military:-9,intel:6},h:{ruthless:1}},r:{t:'默许此事。',f:{military:5,morale:-6,intel:-5},h:{}}},
{id:'w_food_lo',ch:'camp',tier:'base',cs:{food:[0,25]},theme:'百姓苍生',title:'杀马',t:'伙头军跪在帐前：粮草只够三天了。士兵们开始看战马的眼神不对了。',l:{t:'宰马充饥。',f:{food:8,military:-8},h:{ruthless:1}},r:{t:'减半口粮，再撑几天。',f:{food:8,morale:-8},h:{righteous:1}}},
{id:'w_food_lo2',ch:'camp',tier:'base',cs:{food:[0,25]},theme:'百姓苍生',title:'薄粥',t:'今日的粥稀得能照见人脸。一个新兵把碗舔得干干净净，又偷偷看向旁人的碗。伙夫不敢抬头。',l:{t:'搜刮富户。',f:{food:8,morale:-8,intel:-5},h:{ruthless:1}},r:{t:'开将官私仓。',f:{food:7,morale:6,military:-5},h:{righteous:1}}},
{id:'w_food_lo3',ch:'camp',tier:'base',cs:{food:[0,25]},theme:'百姓苍生',title:'空仓',t:'仓门打开时，灰尘先飘出来。最底下几粒陈米粘在木缝里，管库官伸手去抠，指甲都裂了。',l:{t:'借粮不还。',f:{food:9,morale:-7},h:{ruthless:1}},r:{t:'许息借粮。',f:{food:7,intel:-5,morale:5},h:{}}},
{id:'w_food_hi',ch:'camp',tier:'base',cs:{food:[75,100]},theme:'百姓苍生',title:'满仓',t:'粮仓堆得太满，麻袋压弯了木梁。仓吏笑得合不拢嘴，账册上的墨点却越来越多。',l:{t:'清查仓账。',f:{food:-5,intel:7,morale:5},h:{}},r:{t:'继续囤粮。',f:{food:8,morale:-5,intel:-7},h:{}}},
{id:'w_food_hi2',ch:'camp',tier:'base',cs:{food:[75,100]},theme:'幕帷之间',title:'鼠洞',t:'粮仓墙角多了几个鼠洞。管库官说只是老鼠，红袖若在，定会说老鼠也懂挑富贵门钻。',l:{t:'换掉管库官。',f:{food:-6,intel:6},h:{ruthless:1}},r:{t:'加盖新仓。',f:{food:8,military:-5,morale:-5},h:{}}},
{id:'w_food_hi3',ch:'camp',tier:'base',cs:{food:[75,100]},theme:'百姓苍生',title:'陈米',t:'旧米开始发霉，新米还在入仓。伙夫说再不分出去，粮仓会先替敌人打败你。',l:{t:'开仓换新。',f:{food:-5,morale:7},h:{righteous:1}},r:{t:'晒干再囤。',f:{food:8,morale:-5,intel:-7},h:{}}},
{id:'w_mor_lo',ch:'camp',tier:'base',cs:{morale:[0,25]},theme:'百姓苍生',title:'闭户',t:'你策马穿过长街，家家户户都关着门。只有窗缝里露出眼睛，像一排排暗处的针。',l:{t:'挨户查问。',f:{morale:-5,intel:8},h:{ruthless:1}},r:{t:'减役三日。',f:{morale:9,food:-5,military:-5},h:{righteous:1}}},
{id:'w_mor_lo2',ch:'camp',tier:'base',cs:{morale:[0,25]},theme:'百姓苍生',title:'石子',t:'有人朝你的车驾扔了一颗石子。亲兵立刻拔刀，人群却没有散，只是沉默地看着你。',l:{t:'抓出带头人。',f:{morale:-6,intel:7},h:{ruthless:1}},r:{t:'下车拾石。',f:{morale:5,military:-5},h:{righteous:1}}},
{id:'w_mor_lo3',ch:'camp',tier:'base',cs:{morale:[0,25]},theme:'百姓苍生',title:'冷街',t:'长街上没有叫卖声，连狗都不吠。你经过一口井，井边的人看见你的甲，立刻低头假装打水。',l:{t:'敲锣训街。',f:{morale:-5,intel:8},h:{ruthless:1}},r:{t:'步行巡街。',f:{morale:9,military:-5},h:{righteous:1}}},
{id:'w_mor_hi',ch:'camp',tier:'base',cs:{morale:[75,100]},theme:'百姓苍生',title:'万民伞',t:'百姓们联名送来万民伞。声势太大了，连邻国的诸侯都开始警惕——一个被百姓封为圣人的将军，比暴君更可怕。',l:{t:'收下万民伞。',f:{morale:5,military:-5},h:{}},r:{t:'退回去，低调行事。',f:{morale:-10,intel:5},h:{}}},
{id:'w_mor_hi2',ch:'camp',tier:'base',cs:{morale:[75,100]},theme:'百姓苍生',title:'生祠',t:'城东有人为你立了生祠，香火旺得像小庙。老匠人问神像的眉眼要不要照着你本人刻。',l:{t:'拆掉生祠。',f:{morale:-10,intel:5},h:{}},r:{t:'让他们刻。',f:{morale:5,food:-5,intel:-5},h:{}}},
{id:'w_mor_hi3',ch:'camp',tier:'base',cs:{morale:[75,100]},theme:'百姓苍生',title:'颂歌',t:'孩子们在巷口唱你的颂歌，调子轻快得吓人。歌词里说你不会败，也不会错。幕僚听完，脸色比战报还难看。',l:{t:'改掉歌词。',f:{morale:-8,intel:5},h:{}},r:{t:'赏那些孩子。',f:{morale:5,food:-5,intel:-5},h:{}}},
{id:'w_int_lo',ch:'camp',tier:'base',cs:{intel:[0,25]},theme:'幕帷之间',title:'盲路',t:'三支斥候走了三条路，却带回三份互相矛盾的地图。你盯着沙盘，忽然觉得每一条线都像陷阱。',l:{t:'派骑兵探路。',f:{intel:8,military:-5},h:{}},r:{t:'重金买消息。',f:{intel:5,food:-5},h:{}}},
{id:'w_int_lo2',ch:'camp',tier:'base',cs:{intel:[0,25]},theme:'幕帷之间',title:'断鸽',t:'信鸽棚一夜死了大半，羽毛散在地上。看守说可能是病，你却在鸽笼缝里摸到一点细盐。',l:{t:'严审看守。',f:{intel:9,morale:-5},h:{ruthless:1}},r:{t:'另建暗线。',f:{intel:7,food:-5},h:{}}},
{id:'w_int_lo3',ch:'camp',tier:'base',cs:{intel:[0,25]},theme:'幕帷之间',title:'错图',t:'军中地图把一条河画成了路。送图的小吏吓得跪倒，说自己也是照旧图描的。旧图来自你父亲那一代。',l:{t:'重绘全图。',f:{intel:5,food:-6},h:{}},r:{t:'先用旧图。',f:{military:5,intel:-5},h:{}}},
{id:'w_int_hi',ch:'camp',tier:'base',cs:{intel:[75,100]},theme:'幕帷之间',title:'杯弓蛇影',t:'你开始怀疑所有人。每一份文书都要亲自过目三遍，每一个幕僚都被暗中监视。营帐里的气氛压抑得令人窒息。',l:{t:'撤掉一半暗哨。',f:{intel:-10,morale:5},h:{righteous:1}},r:{t:'加派人手，再查。',f:{intel:5,morale:-8},h:{ruthless:1}}},
{id:'w_int_hi2',ch:'camp',tier:'base',cs:{intel:[75,100]},theme:'幕帷之间',title:'暗室',t:'暗室里的密信堆到膝盖。每个人都有嫌疑，每个嫌疑又都能找到证据。你听见自己的呼吸在墙上回响。',l:{t:'烧掉旧密信。',f:{intel:-12,morale:6},h:{}},r:{t:'逐封重查。',f:{intel:5,morale:-8,food:-5},h:{}}},
{id:'w_int_hi3',ch:'camp',tier:'base',cs:{intel:[75,100]},theme:'幕帷之间',title:'无眠',t:'第四盏灯油也快烧尽。你仍在读密报，连帐外风吹旗绳，都像有人在低声传信。',l:{t:'熄灯睡去。',f:{intel:-10,morale:5},h:{}},r:{t:'再读一遍。',f:{intel:5,morale:-7},h:{}}},
{id:'d01',ch:'camp',tier:'drain',theme:'沙场点兵',title:'雨夜',t:'雨下得太久，弓弦发软，粮袋发霉，士兵们把湿透的披甲拧出水来。帐外的泥没过靴面，每走一步都像被地面拽住。',l:{t:'冒雨操练。',f:{military:5,food:-5,morale:-5},h:{}},r:{t:'收营避雨。',f:{military:-6,food:8,intel:-5},h:{}}},
{id:'d02',ch:'camp',tier:'drain',theme:'百姓苍生',title:'病营',t:'伤营里咳声连成一片，医官说药材只够一半人用。你看见几个轻伤兵把药碗推给重伤的人，谁也没说话。',l:{t:'先救重伤。',f:{military:-7,morale:-5},h:{}},r:{t:'均分药汤。',f:{military:-5,morale:-6,food:-5},h:{}}},
{id:'d03',ch:'camp',tier:'drain',theme:'幕帷之间',title:'漏账',t:'账房发现三处漏账，不大，却都卡在要紧处。红封、粮签、军饷像三根细线，扯哪一根都会牵扯出一堆暗帐。',l:{t:'连夜清账。',f:{intel:-7,food:-5,morale:-5},h:{}},r:{t:'先补军饷。',f:{food:8,intel:-7},h:{}}},
{id:'d04',ch:'camp',tier:'drain',theme:'沙场点兵',title:'裂甲',t:'一批皮甲在训练中开裂。匠人说皮料太旧，副将说先凑合穿。你摸到裂口边缘，像摸到战场提前张开的嘴。',l:{t:'停训修甲。',f:{military:-6,food:-5},h:{}},r:{t:'照常训练。',f:{military:-5,morale:-5},h:{}}},
{id:'d05',ch:'camp',tier:'drain',theme:'百姓苍生',title:'夜哭',t:'城西整夜有人哭。不是一家，是一片屋檐下此起彼伏。巡兵问要不要驱散，你知道驱散不了死人留下的声音。',l:{t:'派兵巡夜。',f:{military:-5,morale:-5},h:{}},r:{t:'发钱安葬。',f:{food:-6,morale:-5},h:{}}},
{id:'d06',ch:'camp',tier:'drain',theme:'幕帷之间',title:'断讯',t:'北路信使三日未归。地图上的那条路突然变得很长，长到每个幕僚都能从中读出一种坏消息。',l:{t:'再派斥候。',f:{military:-5,intel:-5,food:-5},h:{}},r:{t:'暂断北路。',f:{intel:-6,morale:-5},h:{}}},
{id:'d07',ch:'camp',tier:'drain',theme:'沙场点兵',title:'疲马',t:'马厩里的战马低着头，肋骨在皮下起伏。骑兵长说再跑一次就能赶上敌军，马夫说再跑一次就要埋马。',l:{t:'强行追击。',f:{military:-6,food:-5,morale:-5},h:{}},r:{t:'原地休整。',f:{military:-5,intel:-5},h:{}}},
{id:'d08',ch:'camp',tier:'drain',theme:'百姓苍生',title:'荒田',t:'城外田地荒了几垄，杂草长得比麦苗高。老农说壮丁都在军中，地不会自己记得春天。',l:{t:'借兵助耕。',f:{military:-5,food:8},h:{}},r:{t:'雇人补种。',f:{food:7,morale:-5},h:{}}},
{id:'d09',ch:'camp',tier:'drain',theme:'幕帷之间',title:'空椅',t:'议事时有一把椅子空着。那名幕僚昨夜病倒，桌上的文书无人接手。每个人都看见了空椅，却没人提。',l:{t:'分给众人。',f:{intel:-5,morale:-5},h:{}},r:{t:'你亲自看。',f:{intel:-5,military:-5},h:{}}},
{id:'d10',ch:'camp',tier:'drain',theme:'沙场点兵',title:'坏鼓',t:'战鼓裂了一道缝，敲出来的声音发哑。老鼓手说鼓声若不稳，人心也会跟着散。',l:{t:'换新鼓皮。',f:{military:5,food:-5,morale:-5},h:{}},r:{t:'暂用旧鼓。',f:{military:-5,morale:-5},h:{}}},
{id:'d11',ch:'camp',tier:'drain',theme:'百姓苍生',title:'冷灶',t:'伙房的灶冷得太早，排队的士兵还没散。伙夫把空锅翻给你看，锅底只有一层发黑的米糊。',l:{t:'减半口粮。',f:{food:-5,morale:-7},h:{}},r:{t:'补发干粮。',f:{food:-7,military:-5},h:{}}},
{id:'d12',ch:'camp',tier:'drain',theme:'幕帷之间',title:'假令',t:'一份假军令混进文书堆，幸好被发现得早。没人知道它从哪来，只知道能混进来一次，就能混进来第二次。',l:{t:'重查文书。',f:{intel:-7,morale:-5},h:{}},r:{t:'更换印绶。',f:{intel:-5,food:-5},h:{}}},
{id:'d13',ch:'camp',tier:'drain',mp:2,theme:'沙场点兵',title:'旧伤',t:'老兵的旧伤在阴雨里一起发作，校场上少了三排人。你忽然意识到，活下来的士兵并不是没有代价，只是代价来得晚。',l:{t:'准他们休养。',f:{military:-7,morale:5},h:{}},r:{t:'调新兵补位。',f:{military:5,food:-5,intel:-5},h:{}}},
{id:'d14',ch:'camp',tier:'drain',mp:2,theme:'百姓苍生',title:'黑市',t:'城里出现黑市，药、盐、箭头都能买到，只是价钱像被血浸过。管还是不管，都会有人在暗处笑。',l:{t:'封掉黑市。',f:{food:-5,intel:-5,morale:-5},h:{}},r:{t:'暗中抽税。',f:{food:8,morale:-5,intel:5},h:{}}},
{id:'d15',ch:'camp',tier:'drain',mp:2,theme:'幕帷之间',title:'疑云',t:'一封匿名信说副将私通外敌。证据不足，字迹也太干净。可你读完之后，再看副将的背影已经不一样了。',l:{t:'暗查副将。',f:{intel:-5,morale:-5},h:{}},r:{t:'烧信压下。',f:{intel:-6,military:-5},h:{}}},
{id:'d16',ch:'camp',tier:'drain',mp:2,theme:'沙场点兵',title:'冻河',t:'河面结了薄冰，能走人，不能走车。前锋催你过河，粮队却只能在岸边等。风吹过冰面，声音像裂帛。',l:{t:'前锋先渡。',f:{military:-5},h:{}},r:{t:'等冰加厚。',f:{food:-5},h:{}}},
{id:'d17',ch:'camp',tier:'drain',mp:2,theme:'百姓苍生',title:'逃户',t:'一夜之间，城南少了二十七户。灶灰还热，门却开着。百姓逃走时没有带走桌上的粗碗，像怕多拿一点就会跑不动。',l:{t:'追逃户。',f:{military:-5,morale:-7},h:{}},r:{t:'免役招回。',f:{food:-5,intel:-7},h:{}}},
{id:'d18',ch:'camp',tier:'drain',mp:2,theme:'幕帷之间',title:'错判',t:'你之前采信的一份情报错了。损失不大，却足够让所有人说话慢半拍。错判像一根刺，扎在沙盘中央。',l:{t:'重审探线。',f:{intel:-7,food:-5},h:{}},r:{t:'换掉探头。',f:{intel:-5,morale:-5},h:{}}},
{id:'d19',ch:'camp',tier:'drain',mp:2,theme:'沙场点兵',title:'散阵',t:'新阵法练到一半，前队和后队撞在一起。没有人死，但每个将领的脸都像刚输了一仗。',l:{t:'推倒重练。',f:{military:-5,food:-5},h:{}},r:{t:'改回旧阵。',f:{military:-5,intel:-6},h:{}}},
{id:'d20',ch:'camp',tier:'drain',mp:2,theme:'百姓苍生',title:'疫巷',t:'一条巷子被白布封住，里面的人拍门求水。开门会让疫病扩散，不开门会让哭声先死在门后。',l:{t:'封巷七日。',f:{morale:-8,intel:-5},h:{}},r:{t:'送水送药。',f:{food:-5,military:-5},h:{}}},

// ─── 新增：NPC 羁绊卡 · 阿蛮 ───
{id:'am16',ch:'aman',tier:'base',theme:'帷帐春深',title:'马酒',t:'阿蛮酿了一坛马奶酒，说草原的男人喝完这个才敢开口求亲。她把碗推到你面前，眼睛却看着帐顶。',l:{t:'公事在身。',f:{intel:5},h:{aman_aff:-5}},r:{t:'一饮而尽。',f:{morale:5,food:-5},h:{aman_aff:10,romance:1}},npc_req:'aman'},
{id:'am17',ch:'aman',tier:'base',theme:'沙场点兵',title:'断鬃',t:'她最爱的战马被流矢伤了鬃。阿蛮蹲在马旁很久，回头问你，中原人会不会为一匹马掉眼泪。',l:{t:'换匹新马。',f:{military:5},h:{aman_aff:-6}},r:{t:'陪她守夜。',f:{morale:5,intel:-5},h:{aman_aff:9,romance:1}},npc_req:'aman'},
{id:'am18',ch:'aman',tier:'deep',mp:2,o:1,ca:{aman_aff:55},theme:'帷帐春深',title:'北使',t:'草原来了使者，跪在阿蛮面前，说老王死了，部族要她回去继位。她没看使者，只看你。',l:{t:'你该回去。',f:{morale:-5,intel:5},h:{aman_aff:-5,righteous:1},a:['am18b']},r:{t:'留下来。',f:{military:5,morale:5},h:{aman_aff:10},a:['am18b']},npc_req:'aman'},
{id:'am18b',ch:'aman',tier:'deep',o:1,theme:'帷帐春深',title:'两鞭',t:'使者留下两条马鞭：一条系着草原的狼尾，一条是你帐中的旧物。阿蛮把两条都攥在手里，指节发白。',l:{t:'替她选草原。',f:{intel:5,morale:-5},h:{aman_aff:-3,righteous:1},a:['am18c']},r:{t:'让她自己选。',f:{morale:5},h:{aman_aff:8},a:['am18c']},npc_req:'aman'},
{id:'am18c',ch:'aman',tier:'rare',o:1,theme:'帷帐春深',title:'断尾',t:'阿蛮当着使者的面，把狼尾鞭扔进火里。她说草原会记住每个人的名字，但她要先记住自己想留在哪。火光照着她的脸，没有半分犹豫。',l:{t:'那就并肩。',f:{military:6,morale:5},h:{aman_aff:12}},r:{t:'给她退路。',f:{morale:6,intel:5},h:{aman_aff:10,righteous:1}},npc_req:'aman'},

// ─── 新增：NPC 羁绊卡 · 红袖 ───
{id:'hs16',ch:'hongsiu',tier:'base',theme:'帷帐春深',title:'分红',t:'红袖把一年的商利摊在案上，推一半给你。她说生意场上没有白拿的钱，问你敢不敢收。',l:{t:'充入军库。',f:{food:8},h:{hongsiu_aff:-4}},r:{t:'与她对半。',f:{food:5,intel:5},h:{hongsiu_aff:9}},npc_req:'hongsiu'},
{id:'hs17',ch:'hongsiu',tier:'base',theme:'幕帷之间',title:'假票',t:'市面上混进一批假银票，仿的正是红袖的票号。她捏着假票冷笑，说有人想借她的信用买命。',l:{t:'官府查办。',f:{intel:6},h:{hongsiu_aff:5}},r:{t:'让她去查。',f:{intel:8,food:-5},h:{hongsiu_aff:8,ruthless:1}},npc_req:'hongsiu'},
{id:'hs18',ch:'hongsiu',tier:'deep',mp:2,o:1,ca:{hongsiu_aff:55},theme:'幕帷之间',title:'大单',t:'红袖说她能吃下敌国一整批军需，转手让敌军无粮可调。但要押上商会三年的本钱，也押上她自己的命。',l:{t:'太险，不做。',f:{food:5,intel:5},h:{hongsiu_aff:-3}},r:{t:'押上去。',f:{food:-5,intel:5},h:{hongsiu_aff:10},a:['hs18b']},npc_req:'hongsiu'},
{id:'hs18b',ch:'hongsiu',tier:'deep',o:1,theme:'帷帐春深',title:'断链',t:'货押到一半，敌国察觉封了商路。红袖的护卫死了三个，她自己也在回来的路上崴了脚，账册却抱得死紧。',l:{t:'弃货保人。',f:{food:-5,morale:5},h:{hongsiu_aff:12,righteous:1},a:['hs18c']},r:{t:'货比人重。',f:{food:8,morale:-6},h:{hongsiu_aff:-5,ruthless:1},a:['hs18c']},npc_req:'hongsiu'},
{id:'hs18c',ch:'hongsiu',tier:'rare',o:1,theme:'帷帐春深',title:'清账',t:'生意成了，敌军那个冬天没能调出一粒粮。红袖把最后一页账推给你，上面只写了一行字：这一单，算我送你的。',l:{t:'记她头功。',f:{food:8,intel:5},h:{hongsiu_aff:8}},r:{t:'问她图什么。',f:{intel:6},h:{hongsiu_aff:10,romance:1}},npc_req:'hongsiu'},

// ─── 新增：NPC 羁绊卡 · 清越（多周目线索）───
{id:'qz16',ch:'qingzhao',tier:'base',theme:'帷帐春深',title:'旧谱',t:'清越在修补一卷残破的乐谱，说这是旧国宫里最后的曲子。她哼了两句就停了，说后半阙再没人记得。',l:{t:'乐谱无用。',f:{intel:5},h:{qingzhao_aff:-5}},r:{t:'替她补谱。',f:{morale:5,intel:-5},h:{qingzhao_aff:9,romance:1}},npc_req:'qingzhao'},
{id:'qz17',ch:'qingzhao',tier:'base',theme:'百姓苍生',title:'错韵',t:'她教孩子们念诗，一个孩子把你的名字编进了韵脚。清越愣了一下，没有纠正，只把那句多念了一遍。',l:{t:'不必如此。',f:{intel:5},h:{qingzhao_aff:-3}},r:{t:'由她去念。',f:{morale:5},h:{qingzhao_aff:8,romance:1}},npc_req:'qingzhao'},
{id:'qz18',ch:'qingzhao',tier:'deep',mp:2,o:1,ca:{qingzhao_aff:55},theme:'幕帷之间',title:'故人',t:'一个旧国遗民找到清越，说只要她肯回去，断剑还能再铸。她把那人请进帐，却让你也坐下旁听。',l:{t:'我先回避。',f:{intel:5},h:{qingzhao_aff:5},a:['qz18b']},r:{t:'留下来听。',f:{intel:6,morale:-5},h:{qingzhao_aff:8},a:['qz18b']},npc_req:'qingzhao'},
{id:'qz18b',ch:'qingzhao',tier:'deep',mp:2,o:1,theme:'幕帷之间',title:'旧约',t:'遗民说出一个名字——那是当年攻破她故国时，签下密约的人。清越看着你，眼神里第一次有了你读不懂的东西。',t2:'遗民说出那个名字时，你的心沉了下去。你已经走过太多遍这条路，早就知道那个名字属于谁：你的父亲。清越看着你，像在等你先开口。',t2_req:['end_qingzhao_sub','end_qingzhao_fall'],l:{t:'这与你无关。',f:{intel:5,morale:-5},h:{qingzhao_aff:-5,ruthless:1},a:['qz18c']},r:{t:'我替父认账。',f:{morale:6},h:{qingzhao_aff:10,righteous:1},a:['qz18c']},npc_req:'qingzhao'},
{id:'qz18c',ch:'qingzhao',tier:'rare',mp:2,o:1,theme:'帷帐春深',title:'不寄',t:'清越写了一封信，写给那个早已不在的故国。写完，她没有寄出，而是折成一只纸船，放进护城河。她说，有些账，记下来就够了。',l:{t:'替她记下。',f:{intel:6,morale:5},h:{qingzhao_aff:12}},r:{t:'陪她送船。',f:{morale:6},h:{qingzhao_aff:10,romance:1,lust:1}},npc_req:'qingzhao'},

// ─── 新增：NPC 羁绊卡 · 巫月 ───
{id:'wy16',ch:'wuyue',tier:'base',theme:'帷帐春深',title:'卦象',t:'巫月替你卜了一卦，卦成却不肯说。你追问，她只说有些话说出来就会成真，问你还想不想听。',l:{t:'不必说了。',f:{intel:5},h:{wuyue_aff:5}},r:{t:'说给我听。',f:{morale:5,intel:-5},h:{wuyue_aff:9,romance:1}},npc_req:'wuyue'},
{id:'wy17',ch:'wuyue',tier:'base',theme:'帷帐春深',title:'守夜',t:'夜里你惊醒，看见巫月坐在帐外。她说你梦里喊了一个名字，她怕那名字招来不该来的东西，便替你守着。',l:{t:'不过是梦。',f:{intel:5},h:{wuyue_aff:-3}},r:{t:'让她进来。',f:{morale:5},h:{wuyue_aff:10,romance:1}},npc_req:'wuyue'},
{id:'wy18',ch:'wuyue',tier:'deep',mp:2,o:1,ca:{wuyue_aff:55},theme:'帷帐春深',title:'神谕',t:'巫月闭眼良久，睁眼时声音不像她自己。她说旧神要一个名字，写进祭文的人，能换全军一场大胜。',l:{t:'写敌将名。',f:{military:5,intel:-5},h:{wuyue_aff:5,ruthless:1},a:['wy18b']},r:{t:'不信神谕。',f:{intel:6,morale:-5},h:{wuyue_aff:-5},a:['wy18b']},npc_req:'wuyue'},
{id:'wy18b',ch:'wuyue',tier:'deep',o:1,theme:'帷帐春深',title:'空名',t:'祭文写好那夜，巫月发起高烧，呓语里全是别人的名字。医官说她在替谁挡灾。你掀开帐帘，祭坛上的火还亮着。',l:{t:'灭了那火。',f:{morale:5,intel:5},h:{wuyue_aff:12,righteous:1},a:['wy18c']},r:{t:'让火烧完。',f:{military:5,morale:-5},h:{wuyue_aff:-3,ruthless:1},a:['wy18c']},npc_req:'wuyue'},
{id:'wy18c',ch:'wuyue',tier:'rare',o:1,theme:'帷帐春深',title:'退位',t:'烧退后，巫月把祭司的银冠埋进了土里。她说神明问她要名字时，她写了自己的，又划掉了。她说这一次，她想替自己活。',l:{t:'那就活着。',f:{morale:6,intel:5},h:{wuyue_aff:12}},r:{t:'我陪你活。',f:{morale:6},h:{wuyue_aff:10,romance:1,lust:1}},npc_req:'wuyue'},

// ─── 新增：连环事件链 · 质子 ───
{id:'c128',ch:'camp',tier:'deep',o:1,theme:'幕帷之间',title:'质子',t:'敌城送来一个孩子做质子，说是城主幼子。他穿着不合身的锦袍，站在中军帐里一句话不说，只盯着你腰间的刀。',l:{t:'严加看管。',f:{intel:6,morale:-5},h:{ruthless:1},a:['c128b']},r:{t:'以礼相待。',f:{morale:6,food:-5},h:{righteous:1},a:['c128b']}},
{id:'c128b',ch:'camp',tier:'deep',o:1,theme:'幕帷之间',title:'旧伤',t:'孩子半夜发烧，掀开衣襟，背上全是旧鞭痕——不是你的人打的。他低声说，城主从没把他当儿子，送他来，是盼他死在这儿。',l:{t:'送还敌城。',f:{intel:5,morale:-5},h:{ruthless:1},a:['c128c']},r:{t:'留下养着。',f:{morale:6,food:-5},h:{righteous:1},a:['c128c']}},
{id:'c128c',ch:'camp',tier:'rare',o:1,theme:'幕帷之间',title:'认主',t:'几个月后，敌城来索质子。那孩子却跪在你帐前，说哪儿也不去。他不懂军政，只知道这是第一个没拿他换过东西的地方。',l:{t:'物归原主。',f:{intel:6,food:8,morale:-6},h:{ruthless:1}},r:{t:'收为义子。',f:{morale:8,military:5,food:-5},h:{righteous:1}}},

// ─── 新增：多周目变体文案 ───
{id:'c129',ch:'camp',tier:'base',theme:'乱世之初',title:'无月',t:'又是一个没有月亮的夜。守夜人说，你父亲死在这样的夜里。你摩挲着兵符，第一次真切地害怕起来。',t2:'又是一个没有月亮的夜。你早已不怕黑了——你知道天亮之后会发生什么，也知道自己撑不撑得到那一天。',t2_req:['end_unify','end_emperor'],l:{t:'独坐到天明。',f:{intel:5,morale:-5},h:{}},r:{t:'召人议事。',f:{intel:5,military:5},h:{}}},
{id:'c130',ch:'camp',tier:'deep',mp:2,theme:'乱世之初',title:'似曾',t:'城门下又出现那个卖草鞋的道人。他看你的眼神像是认得你，却又像第一次见。他说：你这把刀，好像收过又拔出来过。',t2:'卖草鞋的道人又来了。这次他什么也没说，只把一双草鞋放下就走。你认得那草鞋——曾经有一世，你穿着它走进过春雨。',t2_req:['end_retire'],l:{t:'又赶他走。',f:{military:5,intel:-5},h:{ruthless:1}},r:{t:'收下草鞋。',f:{morale:5,intel:5},h:{}}},

// ─── 新增：数值区间触发卡（双数值组合）───
{id:'c131',ch:'camp',tier:'base',cs:{military:[70,100],morale:[0,30]},theme:'沙场点兵',title:'穷兵',t:'军营一日壮过一日，城里的灯却一日比一日少。副将说兵强马壮，老仆却低声说，强兵养在饿城里，迟早要回头咬人。',l:{t:'继续扩军。',f:{military:5,morale:-6},h:{ruthless:1}},r:{t:'分兵屯田。',f:{military:-50,food:8,morale:6},h:{righteous:1}}},
{id:'c132',ch:'camp',tier:'base',cs:{food:[70,100],intel:[0,30]},theme:'幕帷之间',title:'饱盲',t:'粮仓堆得冒尖，斥候却三天没递回一张准图。粮官说仓里有的是底气，谋士说底气最厚的人，往往看不见脚下的坑。',l:{t:'高枕无忧。',f:{food:5,intel:-5},h:{}},r:{t:'散粮买信。',f:{food:-8,intel:8},h:{}}},
{id:'c133',ch:'camp',tier:'base',cs:{morale:[70,100],military:[0,30]},theme:'沙场点兵',title:'虚名',t:'百姓爱戴你，连邻城都听说了你的仁名。可你的兵册薄得吓人。幕僚苦笑，说仁君的名声，挡不住一支饿狼般的军队。',l:{t:'借名募兵。',f:{military:8,morale:-6},h:{}},r:{t:'修德缓兵。',f:{morale:5,military:-5},h:{righteous:1}}},
{id:'c134',ch:'camp',tier:'base',cs:{intel:[70,100],food:[0,30]},theme:'幕帷之间',title:'巧妇',t:'你算得清敌军每一步，却算不出明天三千人吃什么。谋士的妙计写满了纸，纸却不能下锅。',l:{t:'设计夺粮。',f:{food:8,intel:-5,morale:-5},h:{ruthless:1}},r:{t:'缓战筹粮。',f:{food:5,military:-5},h:{}}},
];

// ─── STATE ───
let G={},SD={playthrough:0,unlocked:[],maxMonths:0,relics:[],maxCities:0};
function fresh(){return{military:50,food:50,morale:50,intel:50,
  aman_aff:0,hongsiu_aff:0,qingzhao_aff:0,wuyue_aff:0,
  ruthless:0,righteous:0,lust:0,romance_count:0,harem_count:0,
  month:0,cities_taken:0,cL:0,cR:0,siegeDelay:{},siegeWaits:{},siegeHard:{},hiddenCarry:{},
  harem:[],flags:new Set(),pool:[],used:new Set(),recent:[],nextCards:[],ended:false,cur:null}}

// ─── ENGINE ───
function chainSet(){const s=new Set();CARDS.forEach(c=>{[c.l,c.r].forEach(side=>{if(side&&side.a)side.a.forEach(id=>s.add(id))})});return s}
function initPool(){const ch=chainSet();G.pool=[];CARDS.forEach(c=>{if(c.o&&G.used.has(c.id))return;if(c.mp&&SD.playthrough<c.mp)return;if(ch.has(c.id))return;if(c.npc_req&&!G.harem.includes(c.npc_req))return;if(c.id.startsWith('npc_'))return;G.pool.push(c.id)})}
function rememberCard(c){if(!c)return;G.recent=G.recent||[];G.recent.push(c.id);if(G.recent.length>12)G.recent=G.recent.slice(-12)}
function queueNextCard(id){if(!id)return;G.nextCards=G.nextCards||[];if(!G.nextCards.includes(id))G.nextCards.push(id)}
function isSiegeCard(c){return !!(c&&((c.l&&c.l.siege)||(c.r&&c.r.siege)))}
function siegeCity(c){return c&&c.l&&c.l.siege?c.l.siege.city:c&&c.r&&c.r.siege?c.r.siege.city:null}
function dueSiegeCard(){
  const next=G.cities_taken+1;
  return G.pool.map(id=>CARDS.find(x=>x.id===id)).find(c=>c&&isSiegeCard(c)&&siegeCity(c)===next&&canDraw(c));
}

function canDraw(c){
  if(c.mp&&SD.playthrough<c.mp)return false;
  if(c.o&&G.used.has(c.id))return false;
  if(c.npc_req&&!G.harem.includes(c.npc_req))return false;
  if(isSiegeCard(c)){
    const city=siegeCity(c);
    if(city!==G.cities_taken+1)return false;
    if(G.siegeDelay&&G.siegeDelay[city]&&G.month<G.siegeDelay[city])return false;
  }
  if(c.cs){for(const k in c.cs){const[lo,hi]=c.cs[k];if(G[k]<lo||G[k]>hi)return false}}
  if(c.ca){for(const k in c.ca){if((G[k]||0)<c.ca[k])return false}}
  if(c.cm&&G.month<c.cm)return false;
  return true;
}

function drawCard(){
  if(G.nextCards&&G.nextCards.length){
    while(G.nextCards.length){
      const id=G.nextCards.shift();
      const c=CARDS.find(x=>x.id===id);
      if(c&&canDraw(c)){if(c.o){G.used.add(c.id);G.pool=G.pool.filter(x=>x!==c.id)}rememberCard(c);return c}
    }
  }
  CARDS.forEach(c=>{if((c.cs||c.cm)&&!G.pool.includes(c.id)&&!G.used.has(c.id)&&canDraw(c)){G.pool.push(c.id)}});
  G.pool=[...new Set(G.pool)];
  const siege=dueSiegeCard();
  if(siege){rememberCard(siege);return siege}
  let d=G.pool.map(id=>CARDS.find(x=>x.id===id)).filter(c=>c&&canDraw(c));
  if(!d.length){CARDS.forEach(c=>{if(!c.o&&!c.cs&&!c.ca&&!c.npc_req&&(!c.mp||SD.playthrough>=c.mp)&&!d.find(x=>x.id===c.id))d.push(c)})}
  if(!d.length)return null;
  const fresh=d.filter(c=>!(G.recent||[]).includes(c.id));
  if(fresh.length>=Math.min(8,d.length))d=fresh;
  const flagCards=d.filter(c=>c.l&&c.l.fl||c.r&&c.r.fl);
  if(flagCards.length>0&&Math.random()<0.3){const p=flagCards[Math.floor(Math.random()*flagCards.length)];if(p.o){G.used.add(p.id);G.pool=G.pool.filter(x=>x!==p.id)}rememberCard(p);return p}
  const w=d.map(c=>({card:c,w:TIER_W[c.tier||'base']||60}));
  const total=w.reduce((s,x)=>s+x.w,0);let roll=Math.random()*total;let picked=w[0].card;
  for(const item of w){roll-=item.w;if(roll<=0){picked=item.card;break}}
  if(picked.o){G.used.add(picked.id);G.pool=G.pool.filter(x=>x!==picked.id)}
  rememberCard(picked);
  return picked;
}

function clamp(v){return Math.max(0,Math.min(100,v))}
function dampen(cur,ch){if(ch===0)return 0;const pH=ch>0&&cur>=85,pL=ch<0&&cur<=15;if(!pH&&!pL)return ch;let f=1;if(pH)f=cur>=90?.75:.9;if(pL)f=cur<=10?.75:.9;const d=Math.round(ch*f);return d===0?(ch>0?1:-1):d}
function swingMult(){const n=(SD.relics||[]).length;if(n<=0)return 1.65;if(n===1)return 1.45;if(n===2)return 1.3;if(n<=4)return 1.15;return 1}
function statSwing(v){return Math.round(v*swingMult())}
function getRM(key){let m=1;if(!SD.relics||!SD.relics.length)return m;SD.relics.forEach(rid=>{const r=Object.values(RELICS).find(x=>x.id===rid);if(!r||!r.eff)return;const e=r.eff;if(key==='military'&&e.military_mult)m*=e.military_mult;if(key==='food_pos'&&e.food_pos_mult)m*=e.food_pos_mult;if(key==='morale'&&e.morale_mult)m*=e.morale_mult;if(key==='intel'&&e.intel_mult)m*=e.intel_mult;if(key==='intel_pos'&&e.intel_pos_mult)m*=e.intel_pos_mult;if(key==='ruthless'&&e.ruthless_mult)m*=e.ruthless_mult;if(key==='righteous'&&e.righteous_mult)m*=e.righteous_mult;if(key==='lust'&&e.lust_mult)m*=e.lust_mult;if(key==='aff_pos'&&e.aff_pos_mult)m*=e.aff_pos_mult;if(key==='siege'&&e.siege_bonus)m+=e.siege_bonus});return m}
function hiddenDelta(k,v,rmKey){const m=getRM(rmKey);if(v<=0||m===1)return v;G.hiddenCarry=G.hiddenCarry||{};const raw=v*m+(G.hiddenCarry[k]||0);const out=Math.floor(raw);G.hiddenCarry[k]=raw-out;return out}
function siegeBonus(k){let b=getRM('siege')-1;if(G.harem&&G.harem.includes('aman')&&k==='military')b+=5;if(G.harem&&G.harem.includes('hongsiu')&&k==='food')b+=5;if(G.harem&&G.harem.includes('qingzhao')&&k==='intel')b+=5;if(G.harem&&G.harem.includes('wuyue')&&k==='morale')b+=5;return b}

function apply(side){
  const ch=side==='left'?G.cur.l:G.cur.r;if(!ch)return null;
  if(side==='left'){G.cL++;G.cR=0}else{G.cR++;G.cL=0}
  const delta={};
  if(ch.f){for(const k in ch.f){let v=statSwing(ch.f[k]);if(k==='military')v=Math.round(v*getRM('military'));if(k==='food'&&v>0)v=Math.round(v*getRM('food_pos'));if(k==='morale')v=Math.round(v*getRM('morale'));if(k==='intel'){v=Math.round(v*getRM('intel')*(v>0?getRM('intel_pos'):1))}v=dampen(G[k],v);const o=G[k];G[k]=clamp(G[k]+v);delta[k]=G[k]-o}}
  if(ch.h){for(const k in ch.h){let v=ch.h[k];if(k==='ruthless')v=hiddenDelta(k,v,'ruthless');if(k==='righteous')v=hiddenDelta(k,v,'righteous');if(k==='lust')v=hiddenDelta(k,v,'lust');if(k.endsWith('_aff'))v=hiddenDelta(k,v,'aff_pos');if(k==='romance'){G.romance_count=(G.romance_count||0)+v;continue}G[k]=(G[k]||0)+v}}
  if(ch.fl)G.flags.add(ch.fl);
  if(ch.a)ch.a.forEach(id=>{if(!G.pool.includes(id)&&!G.used.has(id))G.pool.push(id)});
  if(ch.activate){const npc=ch.activate;if(!G.harem.includes(npc)){G.harem.push(npc);G.harem_count=(G.harem_count||0)+1;G[npc+'_aff']=30;const chained=chainSet();CARDS.forEach(c=>{if(c.npc_req===npc&&!chained.has(c.id)&&!G.pool.includes(c.id)&&!G.used.has(c.id))G.pool.push(c.id)})}}
  if(isSiegeCard(G.cur)&&!ch.siege){const city=siegeCity(G.cur);G.siegeDelay=G.siegeDelay||{};G.siegeWaits=G.siegeWaits||{};G.siegeHard=G.siegeHard||{};G.siegeWaits[city]=(G.siegeWaits[city]||0)+1;G.siegeHard[city]=Math.min(15,G.siegeWaits[city]*5);G.siegeDelay[city]=G.month+5;if(G.cur.o)G.used.delete(G.cur.id);if(!G.pool.includes(G.cur.id))G.pool.push(G.cur.id)}
  if(ch.siege){const s=ch.siege;let pass=true;const hard=(G.siegeHard&&G.siegeHard[s.city])||0;for(const k in s.req){if(G[k]<(s.req[k]+hard-siegeBonus(k)))pass=false}
    if(pass){G.cities_taken++;if(s.win.f)for(const k in s.win.f){G[k]=clamp(G[k]+s.win.f[k]);delta[k]=(delta[k]||0)+s.win.f[k]}
      if(G.siegeWaits){delete G.siegeWaits[s.city];delete G.siegeHard[s.city];delete G.siegeDelay[s.city]}
      if(s.win.npc){const npcCard=CARDS.find(c=>c.id==='npc_'+s.win.npc);if(npcCard&&!G.used.has(npcCard.id)){G.pool.push(npcCard.id);queueNextCard(npcCard.id)}}
    }else{return s.lose.die}}
  if(ch.die)return ch.die;
  return delta;
}

function checkEnd(){
  if(SD.playthrough>=7&&G.flags.has('retire_ready'))return'end_retire';
  if(G.flags.has('aman_sub')&&G.aman_aff>=75&&G.military>=50)return'end_aman_sub';
  if(G.flags.has('aman_fall')&&G.aman_aff>=75&&G.romance_count>=1)return'end_aman_fall';
  if(G.flags.has('hongsiu_sub')&&G.hongsiu_aff>=75&&G.food>=50)return'end_hongsiu_sub';
  if(G.flags.has('hongsiu_fall')&&G.hongsiu_aff>=75&&G.romance_count>=1)return'end_hongsiu_fall';
  if(G.flags.has('qingzhao_sub')&&G.qingzhao_aff>=75&&G.intel>=50)return'end_qingzhao_sub';
  if(G.flags.has('qingzhao_fall')&&G.qingzhao_aff>=75&&G.romance_count>=1)return'end_qingzhao_fall';
  if(G.flags.has('wuyue_sub')&&G.wuyue_aff>=75&&G.morale>=50)return'end_wuyue_sub';
  if(G.flags.has('wuyue_fall')&&G.wuyue_aff>=75&&G.romance_count>=1)return'end_wuyue_fall';
  if(G.ruthless>=12&&G.military>=90)return'end_tyrant';
  if(G.righteous>=12&&G.morale>=90)return'end_saint';
  if(G.lust>=10&&G.harem_count>=3)return'end_lustking';
  if(G.harem.length>0&&G.harem.every(n=>(G[n+'_aff']||0)<30)&&G.month>=20)return'end_abandoned';
  if(SD.playthrough>=5&&G.harem.length>=4&&G.harem.every(n=>(G[n+'_aff']||0)>=60))return'end_harem_king';
  if(SD.playthrough>=3&&G.cities_taken>=5&&G.month<60&&G.military>=30&&G.military<=70&&G.food>=30&&G.food<=70&&G.morale>=30&&G.morale<=70&&G.intel>=30&&G.intel<=70)return'end_emperor';
  if(G.cities_taken>=5)return'end_unify';
  if(G.military<=0)return'end_mil_0';if(G.military>=100)return'end_mil_100';
  if(G.food<=0)return'end_food_0';if(G.food>=100)return'end_food_100';
  if(G.morale<=0)return'end_mor_0';if(G.morale>=100)return'end_mor_100';
  if(G.intel<=0)return'end_int_0';if(G.intel>=100)return'end_int_100';
  if(G.month>=60)return'end_warlord';
  return null;
}

// ─── UI ───
const $=id=>document.getElementById(id);
function showScr(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active')}

function updateStats(){
  SK.forEach(k=>{const v=G[k];$('rn-'+k).textContent=v;$('rf-'+k).style.width=v+'%';
    $('st-'+k).classList.toggle('danger',v<=15||v>=85)});
  const y=Math.floor(G.month/12)+1;
  $('month-text').textContent='建军第'+(CY[y-1]||y)+'年 · '+CM[G.month%12];
  $('city-text').textContent='已攻克 '+G.cities_taken+' / 5 城';
}
function hints(f){if(!f)return'';return SK.filter(k=>f[k]&&f[k]!==0).map(k=>'<span class="pip p-'+k+'"></span>').join('')}
function getCardText(card){
  if(card.t2&&card.t2_req&&card.t2_req.some(eid=>SD.unlocked&&SD.unlocked.includes(eid)))return card.t2;
  return card.t||'';
}

function showCard(card,fromSide){
  G.cur=card;const el=$('card');
  el.classList.remove('entering','enter-l','enter-r','exit-left','exit-right','exit-fade');
  el.style.transition='';el.style.transform='';el.style.opacity='';
  el.classList.add('draggable');
  $('ch-left').classList.remove('single','armed');$('ch-right').classList.remove('single','armed');
  $('ch-left').style.display='';$('ch-right').style.display='';
  el.setAttribute('data-ch',card.ch);
  const img=CARD_IMG[card.id];const slot=$('card-slot');
  if(slot){
    if(img){slot.classList.add('has-img');slot.style.backgroundImage="url('"+img+"')"}
    else{slot.classList.remove('has-img');slot.style.backgroundImage=''}
    const emblem=$('slot-emblem'),tag=$('slot-tag');
    if(emblem)emblem.textContent=EMBLEM[card.ch]||'帅';
    if(tag)tag.textContent='插画位 · '+(card.title||'illustration');
  }
  $('card-theme').textContent=card.theme||'';
  $('card-title').textContent=card.title||'';
  $('card-text').innerHTML=getCardText(card);
  $('ch-left-t').textContent=card.l.t;$('ch-right-t').textContent=card.r.t;
  $('hints-l').innerHTML=hints(card.l.f);$('hints-r').innerHTML=hints(card.r.f);
  $('swipe-l').textContent=card.l.t;$('swipe-r').textContent=card.r.t;
  void el.offsetWidth;
  el.classList.add(fromSide==='left'?'enter-r':fromSide==='right'?'enter-l':'entering');
}

function floatD(key,val){if(!val||!SL[key])return;const el=document.createElement('div');
  el.className='sfloat '+(val>0?'up':'dn');el.textContent=SL[key]+' '+(val>0?'+':'')+val;
  const rg=$('st-'+key),rr=rg.getBoundingClientRect(),ar=$('app').getBoundingClientRect();
  el.style.left=(rr.left-ar.left+rr.width/2)+'px';el.style.top=(rr.bottom-ar.top+2)+'px';
  $('app').appendChild(el);setTimeout(()=>el.remove(),900)}

// ─── LOG ───
const LOGS=[
  '副将说，最难的不是打仗，是打完仗之后该怎么活。',
  '粮草和军心一样，看不见的时候消耗最快。',
  '民心这东西，得到容易，失去更容易。',
  '情报是战场上最贵的货。假的比真的还贵。',
  '斥候报告：东边的诸侯又在扩军了。',
  '伙头军今天做了一锅好汤。士气肉眼可见地涨了。',
  '幕僚说，善于用人的将军不需要自己拔剑。',
  '老兵说，能活着从战场上回来的人，要么很强，要么很怂。',
  '你习惯睡前把兵符擦一遍，像擦一块不肯愈合的旧伤。',
  '父亲留下的旧地图边角磨得发白，五座城却被朱砂圈得很新。',
  '你不喜欢别人叫你少主。那像是在提醒你，父亲还没真正死远。',
  '军帐里最安静的时候，往往是所有人都在等你先说错一句话。',
  '有些决定也许只是一瞬，实际是在给日后埋钉子。',
  '兵法来自失败。每一次覆灭，都会把一点教训留到下一次出征。',
  '水满则溢，月满则亏，自满则败，自矜则愚。',
  '攻城是里程碑。月份到了，下一座城会来找你；准备不足，城墙不会心软。',
  '幕僚提醒你：兵力压过一切时，将领也会开始觉得自己压过你。',
  '粮仓太满会养出虫鼠，也会养出贪心的人。',
  '民心太盛时，百姓会把你举上神坛；神坛很高，也很难下来。',
  '谋略太高时，每个人都像棋子。棋子不会爱你，只会被你摆远。',
  '你开始能从传令兵的脚步声里听出胜败，这本事并不让人快乐。',
  '城外的流民越来越会看旗色。乱世教人的第一课，是判断谁还有粮。',
  '老兵说，你挥手时像你父亲；他说完又立刻低头，仿佛这不是夸奖。'
];
const NPC_LOGS={
  aman:[
    '阿蛮不爱听军令，却总能第一个听见马蹄声。',
    '阿蛮把短刀磨得很亮。她说刀钝了，人就会开始讲道理。',
    '阿蛮今日没进主帐。巡营的兵说，她在城墙上看了一整夜的风。',
    '阿蛮笑你坐姿太像王。她说真正的狼王，睡觉也该留一只眼。',
    '阿蛮替你赶走了一个醉兵，却没领赏，只把那人的酒袋拿走了。',
    '阿蛮说草原的誓言很短，短到背叛时也不会卡在喉咙里。'
  ],
  hongsiu:[
    '红袖看账时很少眨眼。她说账本不会骗人，骗人的是写账的人。',
    '红袖今日又盘了一遍粮账。她说亏空不会消失，只会换个名字。',
    '红袖把一枚金叶子夹进账册。她说乱世里，漂亮东西也要会藏身。',
    '红袖笑着同商人饮茶，茶凉之后，那人主动补齐了三车军粮。',
    '红袖说银钱最像人心，攥得越紧，越容易从指缝里漏出去。',
    '红袖替你留了一盏灯。灯旁压着账本，也压着一封没署名的信。'
  ],
  qingzhao:[
    '清越写字极慢，像每一笔都在和旧国告别。',
    '清越把一封旧信折了三折，像把某个名字藏回雪里。',
    '清越今日没有焚书。她只是把灰扫进小盒，说灰也曾经是字。',
    '清越说诗不能退敌，但能让活下来的人记得自己为何还活着。',
    '清越望着新降的城池很久。她说城墙换旗，比人心换主容易。',
    '清越替你改了一句军令。少了三个字，跪地的人便少了一排。'
  ],
  wuyue:[
    '巫月祈祷时从不闭眼。她说神明若真的在，也该学会被人直视。',
    '巫月把香灰吹进夜风里。她说神谕太轻，落到人间才会变重。',
    '巫月腕上的银铃今日响了一声。她听见后，反而沉默了很久。',
    '巫月说旧神不挑祭品，只挑最舍不得失去东西的人。',
    '巫月替伤兵合上眼睛。她没有念经，只轻声问他还冷不冷。',
    '巫月把碎神像擦干净。她说神明死去时，也该体面一点。'
  ],
  any:[
    '帷帐里多了一盏灯，也多了一种不能轻易说出口的麻烦。',
    '有人把她们称作赏赐。你知道这两个字迟早会惹出祸来。',
    '亲近一个人，会让另一个人学会沉默。沉默有时比争吵更危险。',
    '后宫不是奖赏栏。留下一个人，也等于把她的麻烦一并留下。'
  ]
};
const WARNS={
  military_low:['营中逃兵越来越多。再不加军饷，明天连站岗的人都凑不齐了。','兵力太低时，攻城只是把人命递到城墙下。'],
  military_high:['军旗太多，也会遮住帅旗。兵力过盛时，将领们会先学会抬头。','你握着很多刀，但每一把刀都有自己的手。'],
  food_low:['粮仓见底了。士兵开始偷吃马料。','粮草太低，最先倒下的不是人，是军令。'],
  food_high:['粮仓满得让仓吏睡不着。粮草过盛，也会招来蛀虫和账本里的黑洞。','粮食堆太高时，贪心的人会先闻到香味。'],
  morale_low:['百姓看你的眼神越来越冷。民心太低，城门会从里面打开。','街上没人骂你了。这比骂声更糟。'],
  morale_high:['百姓的赞歌传遍了三州。有人开始叫你"圣人"——这不是好事。','民心太高时，敌人会给你安上一个必须讨伐的名号。'],
  intel_low:['探子带回来的路越来越模糊。谋略太低，下一步就可能踩进伏地。','没人知道敌军在哪里，这通常说明敌军已经很近了。'],
  intel_high:['你已经三天没合眼了。每一份文书都可能藏着阴谋——至少你是这么觉得的。','谋略太高时，连忠诚都会被你看成伪装。']
};
function updateLog(){const el=$('log-text');if(!el)return;
  const w=[];if(G.military<=15)w.push(...WARNS.military_low);if(G.military>=85)w.push(...WARNS.military_high);if(G.food<=15)w.push(...WARNS.food_low);if(G.food>=85)w.push(...WARNS.food_high);if(G.morale<=15)w.push(...WARNS.morale_low);if(G.morale>=85)w.push(...WARNS.morale_high);if(G.intel<=15)w.push(...WARNS.intel_low);if(G.intel>=85)w.push(...WARNS.intel_high);
  if(w.length){el.textContent=w[Math.floor(Math.random()*w.length)];el.className='log-text warn';return}
  const logs=LOGS.slice();
  if(G.harem&&G.harem.length){
    logs.push(...NPC_LOGS.any);
    G.harem.forEach(n=>{if(NPC_LOGS[n])logs.push(...NPC_LOGS[n])});
  }
  el.textContent=logs[Math.floor(Math.random()*logs.length)];el.className='log-text'}

// ─── ACTIONS ───
let busy=false;
function exitCard(side,cb){const el=$('card');el.classList.remove('entering','enter-l','enter-r','draggable');
  el.style.transition='transform .42s cubic-bezier(.4,0,.2,1),opacity .4s';
  const W=(window.innerWidth||440);void el.offsetWidth;
  if(side==='left'){el.style.transform='translateX('+(-W*0.95)+'px) rotate(-9deg)';el.style.opacity='0'}
  else if(side==='right'){el.style.transform='translateX('+(W*0.95)+'px) rotate(9deg)';el.style.opacity='0'}
  else{el.style.transform='scale(.94)';el.style.opacity='0'}
  setTimeout(cb,400)}

function doChoose(side){if(busy||G.ended)return;busy=true;clearArm();
  exitCard(side,()=>{const r=apply(side);G.month++;
    if(typeof r==='string'){trigEnd(r);busy=false;return}
    if(r)for(const k in r)floatD(k,r[k]);
    updateStats();updateLog();Store.save('save',SD);
    const e=checkEnd();if(e){setTimeout(()=>{trigEnd(e);busy=false},150);return}
    setTimeout(()=>{const n=drawCard();if(n)showCard(n,side);saveGame();busy=false},250)})}

function trigEnd(eid){G.ended=true;clearGame();
  const e=ENDINGS.find(x=>x.id===eid);if(!e)return;
  const isNew=!SD.unlocked.includes(eid);if(isNew)SD.unlocked.push(eid);
  if(G.month>SD.maxMonths)SD.maxMonths=G.month;
  if(G.cities_taken>SD.maxCities)SD.maxCities=G.cities_taken;
  let rA=null;const rD=RELICS[eid];if(rD&&!SD.relics.includes(rD.id)){SD.relics.push(rD.id);rA=rD}
  Store.save('save',SD);updateSeal();
  $('e-cat').textContent=CATL[e.cat]||'';$('e-title').textContent=e.title;$('e-desc').textContent=e.desc;
  const art=$('e-art'),img=$('e-img'),artCat=$('e-art-cat');
  if(artCat)artCat.textContent=e.title||'列城之主';
  if(art&&img){
    const src=ENDING_IMG[eid]||ENDING_IMG[e.cat]||ENDING_IMG.default;
    art.classList.remove('has-img');
    img.removeAttribute('src');
    if(src){
      img.onload=()=>art.classList.add('has-img');
      img.onerror=()=>art.classList.remove('has-img');
      img.src=src;
    }
  }
  const y=Math.floor(G.month/12),m=G.month%12;$('e-meta').textContent='在位 '+(y>0?y+' 年 ':'')+m+' 个月';
  $('e-cycle').textContent='第 '+SD.playthrough+' 次出征';$('e-gcount').textContent='图鉴 '+SD.unlocked.length+'/'+ENDINGS.length;
  if(rA){$('e-relic').style.display='block';$('e-relic').textContent='获得兵法 · '+rA.name+'：'+rA.desc}else{$('e-relic').style.display='none'}
  setTimeout(()=>showScr('scr-end'),200)}

// ─── GALLERY ───
function showGallery(){showScr('scr-gal');$('g-count').textContent=SD.unlocked.length+' / '+ENDINGS.length;galTab(document.querySelector('.g-tab.on')||document.querySelector('.g-tab'))}
function galTab(el){document.querySelectorAll('.g-tab').forEach(t=>t.classList.remove('on'));el.classList.add('on');const list=$('g-list');list.innerHTML='';ENDINGS.filter(e=>e.cat===el.dataset.cat).forEach(e=>{const ok=SD.unlocked.includes(e.id);const d=document.createElement('div');d.className='g-item '+(ok?'unlocked':'locked');d.innerHTML='<div class="g-item-t">'+(ok?e.title:'？？？')+'</div><div class="g-item-d">'+(ok?e.desc:'')+'</div>'+(ok?'':'<div class="g-item-h">'+(e.hint||'')+'</div>');list.appendChild(d)})}

// ─── SEAL ───
function toggleSeal(){$('seal-panel').classList.toggle('open')}
document.addEventListener('click',e=>{if(!e.target.closest('.seal-btn')&&!e.target.closest('.seal-panel'))$('seal-panel').classList.remove('open')});
function updateSeal(){if(!SD.relics||!SD.relics.length){$('seal-toggle').style.display='none';return}$('seal-toggle').style.display='';const list=$('seal-list');list.innerHTML='';SD.relics.forEach(rid=>{const r=Object.values(RELICS).find(x=>x.id===rid);if(!r)return;const d=document.createElement('div');d.className='seal-item';d.innerHTML='<span class="seal-name">'+r.name+'</span><span class="seal-desc">'+r.desc+'</span>';list.appendChild(d)})}

// ─── SAVE/LOAD ───
function saveGame(){const sg=Object.assign({},G);sg.flags=Array.from(G.flags);sg.used=Array.from(G.used);sg.curId=G.cur?G.cur.id:null;delete sg.cur;Store.save('game',sg)}
function loadGame(){const sg=Store.load('game');if(!sg)return false;Object.assign(G,sg);G.flags=new Set(sg.flags||[]);G.used=new Set(sg.used||[]);G.recent=G.recent||[];G.nextCards=G.nextCards||[];G.siegeDelay=G.siegeDelay||{};G.siegeWaits=G.siegeWaits||{};G.siegeHard=G.siegeHard||{};G.hiddenCarry=G.hiddenCarry||{};if(sg.curId)G.cur=CARDS.find(c=>c.id===sg.curId);return true}
function clearGame(){Store.del('game')}
function migrateSaveIds(){if(!SD.unlocked)SD.unlocked=[];if(!SD.relics)SD.relics=[];if(SD.unlocked.includes('end_saint_end')&&!SD.unlocked.includes('end_saint'))SD.unlocked.push('end_saint');SD.unlocked=SD.unlocked.filter(id=>id!=='end_saint_end')}
function syncRelicsFromUnlocks(){if(!SD.unlocked)SD.unlocked=[];if(!SD.relics)SD.relics=[];let changed=false;SD.unlocked.forEach(eid=>{const r=RELICS[eid];if(r&&!SD.relics.includes(r.id)){SD.relics.push(r.id);changed=true}});if(changed)Store.save('save',SD)}

// ─── RESET ───
function confirmReset(){$('modal').classList.add('show')}
function hideModal(){$('modal').classList.remove('show')}
function doReset(){SD={playthrough:0,unlocked:[],maxMonths:0,relics:[],maxCities:0};Store.del('save');Store.save('save',SD);clearGame();hideModal();updateTitle();updateSeal()}

// ─── START ───
function startGame(){
  clearGame();SD.playthrough++;Store.save('save',SD);
  G=fresh();initPool();updateStats();showScr('scr-game');updateSeal();
  const op=OPEN[Math.min(SD.playthrough-1,OPEN.length-1)];
  const el=$('card');el.classList.remove('entering','enter-l','enter-r','exit-left','exit-right','exit-fade','draggable');
  el.style.transition='';el.style.transform='';el.style.opacity='';
  el.setAttribute('data-ch','war');
  const emblem=$('slot-emblem'),tag=$('slot-tag');
  if(emblem)emblem.textContent='帅';
  if(tag)tag.textContent='插画位 · '+op.t;
  $('card-theme').textContent=op.c;$('card-title').textContent=op.t;$('card-text').innerHTML=op.desc;
  // single full-width continue button
  $('ch-left').style.display='none';
  $('ch-right').classList.add('single');
  $('ch-right-t').textContent=op.btn;$('hints-l').innerHTML='';$('hints-r').innerHTML='';
  $('swipe-l').textContent=op.btn;$('swipe-r').textContent=op.btn;
  void el.offsetWidth;el.classList.add('entering');
  window._op=true;
  if(window._autoSave)clearInterval(window._autoSave);
  window._autoSave=setInterval(()=>{Store.save('save',SD);saveGame()},30000);
}

function choose(side){
  if(window._op){window._op=false;clearArm();
    exitCard(side==='left'?'left':'right',()=>{$('ch-right').classList.remove('single');$('ch-left').style.display='';
      const c=drawCard();if(c)showCard(c,side);updateLog();saveGame()});return}
  doChoose(side);
}

// ─── DRAG TO SWIPE ───
function clearArm(){$('ch-left').classList.remove('armed');$('ch-right').classList.remove('armed');
  $('swipe-l').style.opacity='0';$('swipe-r').style.opacity='0'}
(function initDrag(){
  const el=$('card');let dragging=false,sx=0,sy=0,dx=0,decided=false,horizontal=false;
  const TH=64;
  function down(e){
    if(busy||G.ended||!$('scr-game').classList.contains('active'))return;
    const p=e.touches?e.touches[0]:e;sx=p.clientX;sy=p.clientY;dx=0;dragging=true;decided=false;horizontal=false;
    el.style.transition='none';
  }
  function move(e){
    if(!dragging)return;const p=e.touches?e.touches[0]:e;dx=p.clientX-sx;const dy=p.clientY-sy;
    if(!decided){if(Math.abs(dx)>8||Math.abs(dy)>8){decided=true;horizontal=Math.abs(dx)>Math.abs(dy)}}
    if(!horizontal)return;
    if(e.cancelable)e.preventDefault();
    const single=window._op;
    const rot=dx/26;
    el.style.transform='translateX('+dx+'px) rotate('+rot+'deg)';
    el.style.opacity=String(Math.max(.4,1-Math.abs(dx)/520));
    if(single){
      const on=Math.abs(dx)>TH;$('swipe-r').style.opacity=on?'1':'0';$('ch-right').classList.toggle('armed',on);
    }else{
      $('swipe-l').style.opacity=dx<-TH?'1':'0';$('swipe-r').style.opacity=dx>TH?'1':'0';
      $('ch-left').classList.toggle('armed',dx<-TH);$('ch-right').classList.toggle('armed',dx>TH);
    }
  }
  function up(){
    if(!dragging)return;dragging=false;
    if(horizontal&&Math.abs(dx)>TH){
      if(window._op){choose('right');return}
      choose(dx<0?'left':'right');return;
    }
    // snap back
    el.style.transition='transform .3s cubic-bezier(.4,0,.2,1),opacity .3s';
    el.style.transform='';el.style.opacity='';clearArm();
  }
  el.addEventListener('mousedown',down);
  window.addEventListener('mousemove',move);
  window.addEventListener('mouseup',up);
  el.addEventListener('touchstart',down,{passive:true});
  el.addEventListener('touchmove',move,{passive:false});
  el.addEventListener('touchend',up,{passive:true});
})();

document.addEventListener('keydown',e=>{if(!$('scr-game').classList.contains('active')||G.ended||busy)return;
  if(e.key==='ArrowLeft'||e.key==='a'){if(!window._op)choose('left')}
  if(e.key==='ArrowRight'||e.key==='d'){choose('right')}});

// ─── TITLE ───
function updateTitle(){
  if(SD.playthrough>0){$('t-info').innerHTML='已出征 '+SD.playthrough+' 次 · 最长在位 '+SD.maxMonths+' 个月 · 最多攻克 '+SD.maxCities+' 城<br>图鉴 '+SD.unlocked.length+'/'+ENDINGS.length;
    if(SD.relics&&SD.relics.length){$('t-relic').textContent='兵法 · '+SD.relics.map(rid=>{const r=Object.values(RELICS).find(x=>x.id===rid);return r?r.name:'?'}).join(' · ')}else{$('t-relic').textContent=''}
  }else{$('t-info').innerHTML='';$('t-relic').textContent=''}}

// ─── INIT ───
function init(){
  const s=Store.load('save');if(s){SD=s;if(!SD.unlocked)SD.unlocked=[];if(!SD.relics)SD.relics=[];if(!SD.maxCities)SD.maxCities=0;migrateSaveIds();syncRelicsFromUnlocks();Store.save('save',SD)}
  if(Store.load('game')){if(loadGame()&&G.cur&&!G.ended){updateStats();showCard(G.cur);updateSeal();showScr('scr-game');return}}
  updateTitle();updateSeal();showScr('scr-title');
}
init();

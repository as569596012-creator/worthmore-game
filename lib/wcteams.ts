// 「World Cup Picker」用的队伍数据:只需队名 + 国旗码(flagcdn),零版权。
// v1 取 16 支夺冠热门组成单败淘汰 bracket(按大致实力/身价排序)。

export interface WcTeam {
  name: string;
  flagCode: string; // flagcdn 码
}

export const WC_TEAMS: WcTeam[] = [
  { name: "England", flagCode: "gb-eng" },
  { name: "Spain", flagCode: "es" },
  { name: "France", flagCode: "fr" },
  { name: "Brazil", flagCode: "br" },
  { name: "Portugal", flagCode: "pt" },
  { name: "Germany", flagCode: "de" },
  { name: "Netherlands", flagCode: "nl" },
  { name: "Argentina", flagCode: "ar" },
  { name: "Italy", flagCode: "it" },
  { name: "Belgium", flagCode: "be" },
  { name: "Uruguay", flagCode: "uy" },
  { name: "Croatia", flagCode: "hr" },
  { name: "Morocco", flagCode: "ma" },
  { name: "Colombia", flagCode: "co" },
  { name: "Japan", flagCode: "jp" },
  { name: "United States", flagCode: "us" },
];

export function flagUrl(team: WcTeam, width = 160): string {
  return `https://flagcdn.com/w${width}/${team.flagCode}.png`;
}
